import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { supabase, createSupabaseClient } from './supabase';

// Load .env.local first, then .env as fallback
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const PORT = process.env.PORT || 7879;

app.use(express.json());

// =============================================================
// Middleware: Extract user from Authorization header
// =============================================================
interface AuthRequest extends express.Request {
    user?: { id: string; email: string };
    supabaseClient?: ReturnType<typeof createSupabaseClient>;
}

async function authMiddleware(
    req: AuthRequest,
    res: express.Response,
    next: express.NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: '未登录 / Not authenticated' });
    }

    const token = authHeader.split(' ')[1];
    const userClient = createSupabaseClient(token);

    const { data: { user }, error } = await userClient.auth.getUser();

    if (error || !user) {
        return res.status(401).json({ error: '无效的令牌 / Invalid token' });
    }

    req.user = { id: user.id, email: user.email || '' };
    req.supabaseClient = userClient;
    next();
}

// =============================================================
// Auth Routes (no middleware needed)
// =============================================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '请输入邮箱和密码 / Email and password required' });
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { name: name || email.split('@')[0] },
        },
    });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json({
        user: data.user,
        session: data.session,
    });
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: '请输入邮箱和密码 / Email and password required' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return res.status(401).json({ error: error.message });
    }

    return res.json({
        user: data.user,
        session: data.session,
    });
});

// POST /api/auth/logout
app.post('/api/auth/logout', authMiddleware, async (req: AuthRequest, res) => {
    const { error } = await supabase.auth.signOut();
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    return res.json({ message: '已登出 / Logged out' });
});

// GET /api/auth/me
app.get('/api/auth/me', authMiddleware, async (req: AuthRequest, res) => {
    return res.json({ user: req.user });
});

// =============================================================
// Profile Routes
// =============================================================

// GET /api/profile
app.get('/api/profile', authMiddleware, async (req: AuthRequest, res) => {
    const { data, error } = await req.supabaseClient!
        .from('profiles')
        .select('*')
        .eq('id', req.user!.id)
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(data);
});

// PUT /api/profile
app.put('/api/profile', authMiddleware, async (req: AuthRequest, res) => {
    const { name, avatar, membership, language } = req.body;

    const { data, error } = await req.supabaseClient!
        .from('profiles')
        .update({ name, avatar, membership, language })
        .eq('id', req.user!.id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(data);
});

// =============================================================
// Account Routes
// =============================================================

// GET /api/accounts
app.get('/api/accounts', authMiddleware, async (req: AuthRequest, res) => {
    const { data, error } = await req.supabaseClient!
        .from('accounts')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const accounts = (data || []).map(transformAccount);
    return res.json(accounts);
});

// POST /api/accounts
app.post('/api/accounts', authMiddleware, async (req: AuthRequest, res) => {
    const { name, nameEn, type, balance, icon, color, description, status } = req.body;

    const { data, error } = await req.supabaseClient!
        .from('accounts')
        .insert({
            user_id: req.user!.id,
            name,
            name_en: nameEn || name,
            type: type || 'Custom',
            balance: balance || 0,
            icon: icon || 'account_balance_wallet',
            color: color || '#137fec',
            description: description || '',
            status: status || 'Active',
        })
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(transformAccount(data));
});

// PUT /api/accounts/:id
app.put('/api/accounts/:id', authMiddleware, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { name, nameEn, type, balance, icon, color, description, status } = req.body;

    const { data, error } = await req.supabaseClient!
        .from('accounts')
        .update({
            name,
            name_en: nameEn,
            type,
            balance,
            icon,
            color,
            description,
            status,
        })
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(transformAccount(data));
});

// DELETE /api/accounts/:id
app.delete('/api/accounts/:id', authMiddleware, async (req: AuthRequest, res) => {
    const { id } = req.params;

    const { error } = await req.supabaseClient!
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Deleted' });
});

// =============================================================
// Transaction Routes
// =============================================================

// GET /api/transactions
app.get('/api/transactions', authMiddleware, async (req: AuthRequest, res) => {
    const { data, error } = await req.supabaseClient!
        .from('transactions')
        .select('*')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    // Transform snake_case to camelCase for frontend compatibility
    const transactions = (data || []).map(transformTransaction);
    return res.json(transactions);
});

// POST /api/transactions
app.post('/api/transactions', authMiddleware, async (req: AuthRequest, res) => {
    const { type, amount, category, categoryIcon, categoryColor, date, account, note } = req.body;

    const { data, error } = await req.supabaseClient!
        .from('transactions')
        .insert({
            user_id: req.user!.id,
            type,
            amount,
            category,
            category_icon: categoryIcon || '',
            category_color: categoryColor || '',
            date: date || new Date().toISOString().split('T')[0],
            account: account || '',
            note: note || '',
        })
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(transformTransaction(data));
});

// PUT /api/transactions/:id
app.put('/api/transactions/:id', authMiddleware, async (req: AuthRequest, res) => {
    const { id } = req.params;
    const { type, amount, category, categoryIcon, categoryColor, date, account, note } = req.body;

    const { data, error } = await req.supabaseClient!
        .from('transactions')
        .update({
            type,
            amount,
            category,
            category_icon: categoryIcon,
            category_color: categoryColor,
            date,
            account,
            note,
        })
        .eq('id', id)
        .eq('user_id', req.user!.id)
        .select()
        .single();

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(transformTransaction(data));
});

// DELETE /api/transactions/:id
app.delete('/api/transactions/:id', authMiddleware, async (req: AuthRequest, res) => {
    const { id } = req.params;

    const { error } = await req.supabaseClient!
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', req.user!.id);

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json({ message: 'Deleted' });
});

// =============================================================
// Transform helpers (DB snake_case → Frontend camelCase)
// =============================================================

function transformAccount(row: any) {
    return {
        id: row.id,
        name: row.name,
        nameEn: row.name_en,
        type: row.type,
        balance: parseFloat(row.balance),
        icon: row.icon,
        color: row.color,
        description: row.description,
        status: row.status,
    };
}

function transformTransaction(row: any) {
    return {
        id: row.id,
        type: row.type,
        amount: parseFloat(row.amount),
        category: row.category,
        categoryIcon: row.category_icon,
        categoryColor: row.category_color,
        date: row.date,
        time: row.date, // Frontend uses 'time' for date filtering
        account: row.account,
        note: row.note,
    };
}

// =============================================================
// Start Server
// =============================================================

app.listen(PORT, () => {
    console.log(`🚀 记账APP 后端服务已启动: http://localhost:${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
});
