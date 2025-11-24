
import { LanguageCode } from '../types';

export const translations: Record<LanguageCode, any> = {
  ar: {
    app_title: "GOLD AI PRO",
    login_title: "تسجيل الدخول",
    register_title: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    confirm_password: "تأكيد كلمة المرور",
    login_btn: "تسجيل الدخول",
    register_btn: "إنشاء حساب",
    create_account: "ليس لديك حساب؟ سجل الآن",
    have_account: "لديك حساب بالفعل؟ تسجيل الدخول",
    logout: "تسجيل الخروج",
    
    bot_status: "حالة البوت",
    status_active: "نشط ويتداول",
    status_stopped: "متوقف",
    
    trading_mode: "نمط التداول",
    lot_size: "حجم العقد",
    mode_scalping: "مضاربة",
    mode_swing: "متأرجح",
    mode_safe: "آمن",
    
    toast_login_success: "تم تسجيل الدخول بنجاح",
    welcome_back: "أهلاً بعودتك!",
    register_success: "تم إنشاء الحساب بنجاح",
    login_now: "يمكنك تسجيل الدخول الآن",

    signal: "الإشارة",
    confidence: "الثقة",
    reasoning: "التحليل",
    support: "الدعم",
    resistance: "المقاومة",
    trade_log: "سجل الصفقات",
    
    new_trade: "صفقة جديدة",
    no_trades: "لا توجد صفقات بعد",
    analyzing: "جاري التحليل...",
    rate_us: "قيمنا",
    rating_thanks: "شكراً لتقييمك!",
    
    select_asset: "اختر الأصل",
    category_commodity: "سلع",
    category_crypto: "عملات رقمية",

    chart_type: "نوع الرسم",
    tf_1m: "1د",
    tf_5m: "5د",
    tf_15m: "15د",
    tf_1h: "1س",
    
    user_balance: "الرصيد",
    open_profit: "الربح المفتوح",
    win_rate: "معدل الربح",
    equity: "سيولة الحساب",
    open_trades: "صفقات مفتوحة",

    ai_analysis: "تحليل الذكاء الاصطناعي",
    suggested_sl: "وقف الخسارة المقترح",
    suggested_tp: "أخذ الربح المقترح",
    live_update: "تحديث مباشر",
    
    breakeven_title: "تأمين الصفقة",
    breakeven_msg: "تم نقل وقف الخسارة إلى نقطة الدخول للصفقة",
    profit_lock_title: "تأمين الأرباح",
    profit_lock_msg: "تم رفع وقف الخسارة لتأمين الربح للصفقة",
    
    log_asset: "الأصل",
    log_type: "النوع",
    log_price: "السعر",
    log_pl: "الربح/الخسارة",
    log_status: "الحالة",

    // New Login Screen
    welcome_back_title: "أهلاً بعودتك",
    welcome_back_subtitle: "بوت تداول الذهب بالذكاء الاصطناعي الأكثر تطوراً",
    login_to_account: "سجل الدخول إلى حسابك",
    forgot_password: "هل نسيت كلمة المرور؟",
    continue_with: "أو المتابعة باستخدام",
    login_error_message: "البريد الإلكتروني أو كلمة المرور غير صحيحة."
  },
  en: {
    app_title: "GOLD AI PRO",
    login_title: "Sign In",
    register_title: "Create Account",
    email: "Email Address",
    password: "Password",
    confirm_password: "Confirm Password",
    login_btn: "Sign In",
    register_btn: "Create Account",
    create_account: "Don't have an account? Sign Up",
    have_account: "Already have an account? Sign In",
    logout: "Logout",

    bot_status: "Bot Status",
    status_active: "Active & Trading",
    status_stopped: "Stopped",

    trading_mode: "Trading Mode",
    lot_size: "Contract Size",
    mode_scalping: "Scalping",
    mode_swing: "Swing",
    mode_safe: "Safe",

    toast_login_success: "Login successful",
    welcome_back: "Welcome back!",
    register_success: "Account created successfully",
    login_now: "You can now log in.",
    
    signal: "Signal",
    confidence: "Confidence",
    reasoning: "Reasoning",
    support: "Support",
    resistance: "Resistance",
    trade_log: "Trade Log",

    new_trade: "New Trade Opened",
    no_trades: "No trades yet.",
    analyzing: "Analyzing...",
    rate_us: "Rate Us",
    rating_thanks: "Thank you for your feedback!",

    select_asset: "Select Asset",
    category_commodity: "Commodities",
    category_crypto: "Crypto",

    chart_type: "Chart Type",
    tf_1m: "1m", 
    tf_5m: "5m", 
    tf_15m: "15m", 
    tf_1h: "1H",

    user_balance: "Balance",
    open_profit: "Open P/L",
    win_rate: "Win Rate",
    equity: "Equity",
    open_trades: "Open Trades",

    ai_analysis: "AI Analysis",
    suggested_sl: "Suggested SL",
    suggested_tp: "Suggested TP",
    live_update: "LIVE",
    
    breakeven_title: "Trade Secured",
    breakeven_msg: "Stop loss moved to breakeven for trade",
    profit_lock_title: "Profit Locked",
    profit_lock_msg: "Stop loss trailed up to lock in profit for trade",
    
    log_asset: "Asset",
    log_type: "Type",
    log_price: "Price",
    log_pl: "P/L",
    log_status: "Status",

    // New Login Screen
    welcome_back_title: "Welcome Back",
    welcome_back_subtitle: "The most advanced AI Gold Trading Bot on the market.",
    login_to_account: "Login to your account",
    forgot_password: "Forgot Password?",
    continue_with: "Or continue with",
    login_error_message: "Invalid email or password."
  }
};