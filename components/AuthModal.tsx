'use client';

import React from 'react';
import { Mail, Lock, Phone, User, Building2, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface AuthModalProps {
  initialTab: 'login' | 'register' | 'corporate-apply';
  onAuthSuccess: (user: any) => void;
  onNavigate: (tab: string) => void;
  allowIndividualAuth?: string;
}

export default function AuthModal({
  initialTab,
  onAuthSuccess,
  onNavigate,
  allowIndividualAuth = 'true'
}: AuthModalProps) {
  const [tab, setTab] = React.useState<'login' | 'register'>(initialTab === 'corporate-apply' ? 'register' : initialTab);
  const [role, setRole] = React.useState<'customer' | 'corporate'>(allowIndividualAuth === 'false' ? 'corporate' : 'customer');

  // Common Form States
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Corporate Specific States
  const [companyName, setCompanyName] = React.useState('');
  const [taxNo, setTaxNo] = React.useState('');
  const [taxOffice, setTaxOffice] = React.useState('');

  // SMS Validation State (For normal customer only)
  const [showSmsVerification, setShowSmsVerification] = React.useState(false);
  const [smsCode, setSmsCode] = React.useState('');
  const [sentCode, setSentCode] = React.useState('');
  const [smsError, setSmsError] = React.useState('');

  React.useEffect(() => {
    setTimeout(() => {
      setTab(initialTab === 'corporate-apply' ? 'register' : initialTab);
      setRole(allowIndividualAuth === 'false' || initialTab === 'corporate-apply' ? 'corporate' : 'customer');
    }, 0);
  }, [initialTab, allowIndividualAuth]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (tab === 'login') {
        // Handle Login
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.success) {
          onAuthSuccess(data.user);
          if (data.user.role === 'admin') {
            onNavigate('admin');
          } else {
            onNavigate('home');
          }
        } else {
          setErrorMsg(data.error || 'Giriş yapılamadı.');
        }
      } else {
        // Handle Register
        // For Normal Customers, trigger SMS verification before actual registration
        if (role === 'customer') {
          const smsRes = await fetch('/api/auth/send-sms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone })
          });
          const smsData = await smsRes.json();
          if (smsData.success) {
            setSentCode(smsData.code);
            setShowSmsVerification(true);
          } else {
            setErrorMsg(smsData.error || 'SMS gönderilemedi.');
          }
        } else {
          // Corporate registration directly (puts application in pending approval status)
          await executeRegister();
        }
      }
    } catch (e: any) {
      setErrorMsg(`Sistem Hatası: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySms = async (e: React.FormEvent) => {
    e.preventDefault();
    setSmsError('');

    if (smsCode !== sentCode) {
      setSmsError('Doğrulama kodu hatalı. Lütfen tekrar deneyin.');
      return;
    }

    // Successfully verified! Run standard register
    setShowSmsVerification(false);
    await executeRegister();
  };

  const executeRegister = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone,
          role,
          companyName: role === 'corporate' ? companyName : undefined,
          taxNo: role === 'corporate' ? taxNo : undefined,
          taxOffice: role === 'corporate' ? taxOffice : undefined,
          address
        })
      });

      const data = await res.json();
      if (data.success) {
        if (role === 'corporate') {
          alert(data.message);
          setTab('login');
        } else {
          alert(data.message);
          onAuthSuccess(data.user);
          onNavigate('home');
        }
      } else {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg(`Kayıt Hatası: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white rounded-2xl border border-slate-100 p-6 shadow-md my-8">
      {/* Tab select Header */}
      <div className="flex border-b border-slate-200 mb-6">
        <button
          onClick={() => { setTab('login'); setErrorMsg(''); }}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            tab === 'login' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Giriş Yap
        </button>
        <button
          onClick={() => { setTab('register'); setErrorMsg(''); }}
          className={`flex-1 pb-3 text-xs font-bold text-center border-b-2 transition-all ${
            tab === 'register' 
              ? 'border-blue-600 text-blue-600' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Kayıt Ol / Başvuru Yap
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Main Authentication Form */}
      <form onSubmit={handleSubmit} className="space-y-4 text-xs text-slate-700">
        {allowIndividualAuth === 'false' && (
          <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl font-bold flex flex-col gap-1.5 mb-4">
            <span className="text-amber-900 font-extrabold uppercase tracking-wider text-[10px]">⚠️ Sadece Kurumsal Erişim</span>
            <p className="text-[10px] leading-relaxed font-semibold">
              Bireysel üye girişleri ve yeni üye kayıtları yönetici kararıyla geçici olarak devre dışı bırakılmıştır. Sadece aktif kurumsal üyelerimiz giriş yapabilir veya yeni kurumsal başvurular oluşturulabilir.
            </p>
          </div>
        )}

        {tab === 'register' && (
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg mb-4">
            <button
              type="button"
              id="role-customer-toggle"
              disabled={allowIndividualAuth === 'false'}
              onClick={() => setRole('customer')}
              className={`flex-1 py-2 text-center font-extrabold rounded-md transition-all text-[11px] cursor-pointer ${
                allowIndividualAuth === 'false'
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed line-through'
                  : role === 'customer'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Bireysel Müşteri (Hızlı Üye) {allowIndividualAuth === 'false' && '(Kapalı)'}
            </button>
            <button
              type="button"
              id="role-corporate-toggle"
              onClick={() => setRole('corporate')}
              className={`flex-1 py-2 text-center font-extrabold rounded-md transition-all text-[11px] cursor-pointer ${
                role === 'corporate'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              Kurumsal Cari Üye (B2B)
            </button>
          </div>
        )}

        {tab === 'register' && role === 'customer' && (
          <div className="bg-blue-50/60 p-3.5 border border-blue-100 rounded-xl space-y-1">
            <h4 className="text-blue-800 font-extrabold text-[11px] uppercase tracking-wide">Hızlı Bireysel Üyelik</h4>
            <p className="text-[10px] text-blue-700 leading-normal">
              Bireysel müşterilerimiz için minimum sipariş limiti <strong>200 TL</strong>&apos;dir. Güvenli sanal POS (Shopier veya PayTR) ile ödemenizi tamamlayabilirsiniz.
            </p>
          </div>
        )}

        {tab === 'register' && role === 'corporate' && (
          <div className="bg-emerald-50/60 p-3.5 border border-emerald-100 rounded-xl space-y-1">
            <h4 className="text-emerald-800 font-extrabold text-[11px] uppercase tracking-wide">B2B Kurumsal Üyelik Başvurusu</h4>
            <p className="text-[10px] text-emerald-700 leading-normal">
              Hanibaba kurumsal cari portalıdır. Kaydolduğunuzda başvurunuz incelenecek ve onaylandığında vergi bilgilerinizle B2B cari hesabı tanımlanacaktır. Kurumsal müşteriler için minimum sipariş limiti <strong>1.500 TL</strong>&apos;dir ve kargo ücretsizdir.
            </p>
          </div>
        )}

        {tab === 'register' && (
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Adınız Soyadınız / Yetkili Adı</label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="Ör: Burak Yılmaz"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border rounded-lg text-slate-800"
              />
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        {/* Corporate fields */}
        {tab === 'register' && role === 'corporate' && (
          <div className="space-y-4 border-l-2 border-emerald-500 pl-3.5 my-3">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">Şirket Resmi Unvanı</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Ör: Hanibaba Ltd. Şti."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
                <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Vergi Dairesi</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: Maslak VD"
                  value={taxOffice}
                  onChange={(e) => setTaxOffice(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Vergi Numarası</label>
                <input
                  type="text"
                  required
                  placeholder="Ör: 1234567890"
                  value={taxNo}
                  onChange={(e) => setTaxNo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-600 mb-1">E-Posta Adresi</label>
          <div className="relative">
            <input
              type="email"
              required
              placeholder="örnek@firma.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {tab === 'register' && (
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Telefon Numarası</label>
            <div className="relative">
              <input
                type="tel"
                required
                placeholder="0555 555 55 55"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 font-mono"
              />
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-600 mb-1">Şifre</label>
          <div className="relative">
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {tab === 'register' && (
          <div>
            <label className="block font-semibold text-slate-600 mb-1">Adres Bilgisi (Seçenek)</label>
            <textarea
              placeholder="Teslimat adresi..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-xs flex items-center justify-center gap-1.5 uppercase"
        >
          {loading ? 'Yükleniyor...' : tab === 'login' ? 'Giriş Yap' : role === 'corporate' ? 'Kurumsal Başvuru Gönder' : 'Kayıt Ol'}
        </button>
      </form>

      {/* SMS Verification Modal popup */}
      {showSmsVerification && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 border border-slate-100 relative text-center">
            <button
              onClick={() => setShowSmsVerification(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold"
            >
              ✕
            </button>
            <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-base font-bold text-slate-900 font-display">
              Telefon SMS Doğrulama
            </h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              <strong>{phone}</strong> numaralı telefona gönderilen 6 haneli doğrulama kodunu girin.
            </p>

            <div className="my-4 p-2.5 bg-blue-50 border border-blue-100 rounded-lg text-[11px] font-semibold text-blue-700">
              [Geliştirici Simülatörü]<br />
              Telefonunuza gelen SMS Kodu: <strong className="font-mono text-xs">{sentCode}</strong>
            </div>

            {smsError && (
              <div className="p-2 mb-3 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[10px] font-semibold">
                {smsError}
              </div>
            )}

            <form onSubmit={handleVerifySms} className="space-y-3">
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={smsCode}
                onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-widest font-mono font-black text-lg py-2.5 bg-slate-50 border rounded-lg focus:outline-hidden"
              />

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg uppercase tracking-wide shadow-xs"
              >
                Kodu Doğrula ve Kaydı Bitir
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
