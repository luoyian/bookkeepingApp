-- =============================================================
-- 记账APP Supabase 数据库初始化脚本
-- 在 Supabase SQL Editor 中执行此脚本来创建所有需要的表
-- =============================================================

-- 1. 用户资料表 profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  avatar TEXT DEFAULT '',
  membership TEXT DEFAULT '普通会员',
  language TEXT DEFAULT 'zh' CHECK (language IN ('zh', 'en')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. 资金账户表 accounts
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT DEFAULT '',
  type TEXT DEFAULT 'Custom',
  balance NUMERIC(12,2) DEFAULT 0,
  icon TEXT DEFAULT 'account_balance_wallet',
  color TEXT DEFAULT '#137fec',
  description TEXT DEFAULT '',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. 交易记录表 transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT '',
  category_icon TEXT DEFAULT '',
  category_color TEXT DEFAULT '',
  date TEXT DEFAULT '',
  account TEXT DEFAULT '',
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================
-- 开启 Row Level Security (RLS)
-- =============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- profiles: 用户只能查看和修改自己的资料
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- accounts: 用户只能操作自己的账户
CREATE POLICY "Users can view own accounts"
  ON accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own accounts"
  ON accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON accounts FOR DELETE
  USING (auth.uid() = user_id);

-- transactions: 用户只能操作自己的交易记录
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================================
-- 创建索引以提高查询性能
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

-- =============================================================
-- 触发器: 用户注册时自动创建 profile
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    ''
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除已有的触发器（如果存在）再创建
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================
-- 触发器: 同步交易记录到账户余额
-- =============================================================

CREATE OR REPLACE FUNCTION public.handle_transaction_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- 新增记录: 支出减余额，收入加余额
    IF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE user_id = NEW.user_id AND (name = NEW.account OR name_en = NEW.account);
    ELSIF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE user_id = NEW.user_id AND (name = NEW.account OR name_en = NEW.account);
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- 删除记录: 反向操作
    IF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE user_id = OLD.user_id AND (name = OLD.account OR name_en = OLD.account);
    ELSIF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE user_id = OLD.user_id AND (name = OLD.account OR name_en = OLD.account);
    END IF;
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    -- 修改记录: 先撤销旧的，再应用新的
    -- 1. 撤销旧的
    IF OLD.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance + OLD.amount WHERE user_id = OLD.user_id AND (name = OLD.account OR name_en = OLD.account);
    ELSIF OLD.type = 'income' THEN
      UPDATE public.accounts SET balance = balance - OLD.amount WHERE user_id = OLD.user_id AND (name = OLD.account OR name_en = OLD.account);
    END IF;
    -- 2. 应用新的
    IF NEW.type = 'expense' THEN
      UPDATE public.accounts SET balance = balance - NEW.amount WHERE user_id = NEW.user_id AND (name = NEW.account OR name_en = NEW.account);
    ELSIF NEW.type = 'income' THEN
      UPDATE public.accounts SET balance = balance + NEW.amount WHERE user_id = NEW.user_id AND (name = NEW.account OR name_en = NEW.account);
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 绑定触发器到 transactions 表
DROP TRIGGER IF EXISTS on_transaction_changed ON public.transactions;
CREATE TRIGGER on_transaction_changed
  AFTER INSERT OR UPDATE OR DELETE ON public.transactions
  FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_change();
