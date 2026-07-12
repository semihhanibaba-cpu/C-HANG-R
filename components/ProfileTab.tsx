'use client';

import React from 'react';
import { 
  User, MapPin, Phone, Lock, FileText, CheckCircle2, 
  Truck, AlertCircle, RefreshCw, BarChart, FileCheck,
  Plus, Trash2, Building2, Home, Mail, Briefcase, Sparkles
} from 'lucide-react';

interface ProfileTabProps {
  user: any;
  onRefreshUser: () => void;
  onLogout?: () => void;
}

export default function ProfileTab({
  user,
  onRefreshUser,
  onLogout
}: ProfileTabProps) {
  const [name, setName] = React.useState(user?.name || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [address, setAddress] = React.useState(user?.address || '');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [msg, setMsg] = React.useState('');
  const [errorMsg, setErrorMsg] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Addresses
  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const [newAddressTitle, setNewAddressTitle] = React.useState('');
  const [newAddressText, setNewAddressText] = React.useState('');
  const [addressMsg, setAddressMsg] = React.useState('');
  const [addressError, setAddressError] = React.useState('');

  // User orders
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(false);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/addresses');
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAddresses(false);
    }
  };

  React.useEffect(() => {
    setTimeout(() => {
      fetchOrders();
      fetchAddresses();
    }, 0);
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Şifreler uyuşmuyor.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          address,
          password: password || undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setMsg(data.message);
        setPassword('');
        setConfirmPassword('');
        onRefreshUser();
      } else {
        setErrorMsg(data.error);
      }
    } catch (error: any) {
      setErrorMsg(`Hata: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressMsg('');
    setAddressError('');

    if (!newAddressTitle.trim() || !newAddressText.trim()) {
      setAddressError('Lütfen başlık ve adres alanlarını doldurun.');
      return;
    }

    try {
      const res = await fetch('/api/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newAddressTitle,
          address: newAddressText
        })
      });

      const data = await res.json();
      if (data.success) {
        setAddressMsg('Yeni adresiniz başarıyla eklendi.');
        setNewAddressTitle('');
        setNewAddressText('');
        fetchAddresses();
      } else {
        setAddressError(data.error || 'Adres eklenirken bir hata oluştu.');
      }
    } catch (error: any) {
      setAddressError(`Hata: ${error.message}`);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const res = await fetch(`/api/addresses?id=${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        fetchAddresses();
      }
    } catch (error) {
      console.error('Delete address error:', error);
    }
  };

  // Helper to get address icon based on title
  const getAddressIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('ev') || t.includes('home')) {
      return <Home className="w-4 h-4 text-blue-600" />;
    }
    if (t.includes('iş') || t.includes('ofis') || t.includes('work') || t.includes('şirket') || t.includes('firma') || t.includes('fabrika') || t.includes('depo')) {
      return <Building2 className="w-4 h-4 text-emerald-600" />;
    }
    return <MapPin className="w-4 h-4 text-purple-600" />;
  };

  return (
    <div className="space-y-8">
      {/* Header Profile Dashboard Overview */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg relative overflow-hidden border border-slate-800">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <User className="w-48 h-48" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-[10px] uppercase tracking-widest bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full">
                {user?.role === 'admin' 
                  ? 'Sistem Yöneticisi' 
                  : user?.role === 'corporate' 
                    ? 'Kurumsal B2B Üyesi' 
                    : 'Bireysel Üye'}
              </span>
              <span className="font-bold text-[10px] uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Hesap Onaylı
              </span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight">
              {user?.name}
            </h2>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-300">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {user?.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {user?.phone}</span>
            </div>
          </div>

          <div className="w-full md:w-auto flex flex-col gap-2 shrink-0">
            {user?.role === 'corporate' ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4" /> Cari Hesap Avantajı
                </div>
                <p className="text-[11px] text-emerald-100 max-w-xs leading-normal">
                  Sipariş limitiniz <span className="font-bold text-white">1.500,00 TL</span>. Kurumsal üyeliğiniz gereği tüm teslimatlarınızda <span className="font-bold text-white">Kargo Ücretsizdir</span>.
                </p>
              </div>
            ) : (
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-left">
                <div className="flex items-center gap-1.5 font-bold text-xs text-blue-400 uppercase tracking-wider mb-1">
                  <Truck className="w-4 h-4" /> Bireysel Alışveriş Şartları
                </div>
                <p className="text-[11px] text-blue-100 max-w-xs leading-normal">
                  Sipariş limitiniz sadece <span className="font-bold text-white">200,00 TL</span> olarak güncellenmiştir! Bireysel gönderilerde 80 TL standart kargo ücreti uygulanır.
                </p>
              </div>
            )}
          </div>
        </div>

        {user?.role === 'corporate' && (user?.companyName || user?.company_name) && (
          <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap gap-6 text-xs text-slate-300">
            <div><span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Firma Unvanı</span><span className="font-bold text-slate-100">{user.companyName || user.company_name}</span></div>
            <div><span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Vergi Dairesi</span><span className="font-bold text-slate-100">{user.taxOffice || user.tax_office || '-'}</span></div>
            <div><span className="text-slate-500 font-semibold block uppercase text-[9px] tracking-wider">Vergi Numarası</span><span className="font-bold text-slate-100">{user.taxNo || user.tax_no || '-'}</span></div>
          </div>
        )}
      </div>

      {/* Main Profile grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Profile Edit Form */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2 font-display">
              <User className="w-4.5 h-4.5 text-blue-600" /> Profil Bilgilerimi Güncelle
            </h3>

            {msg && (
              <div className="p-3 mb-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">
                {msg}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs text-slate-700">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Ad Soyad / Yetkili Adı</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Varsayılan İrtibat Adresi</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Kayıtlı adreslerinizin dışında genel fatura/irtibat adresi..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg h-20 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <span className="block font-bold text-slate-500 text-[10px] uppercase tracking-wider">Şifre Değiştir (İsteğe Bağlı)</span>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Yeni Şifre</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Yeni Şifre (Tekrar)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg mt-2 transition-colors uppercase tracking-wide shadow-sm text-xs cursor-pointer"
              >
                {loading ? 'Güncelleniyor...' : 'Profili Güncelle'}
              </button>
            </form>

            {onLogout && (
              <div className="mt-5 pt-5 border-t border-slate-100">
                <button
                  onClick={onLogout}
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 font-bold py-2.5 rounded-lg transition-colors uppercase tracking-wide text-xs flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" /> Hesaptan Çıkış Yap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right columns: Addresses & Active and Past Orders */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Address Management Panel (Kayıtlı Adreslerim) */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 font-display">
                <MapPin className="w-4.5 h-4.5 text-blue-600" /> Kayıtlı Teslimat Adreslerim
              </h3>
              <span className="text-slate-400 text-xs font-bold font-mono">{addresses.length} Adres</span>
            </div>

            {/* Existing Saved Addresses list */}
            {loadingAddresses ? (
              <div className="text-center py-4 text-xs text-slate-400">Yükleniyor...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-6 bg-slate-50/50 border border-dashed rounded-2xl text-xs text-slate-400 space-y-1">
                <p className="font-semibold">Kayıtlı teslimat adresiniz bulunmuyor.</p>
                <p>Aşağıdaki formu kullanarak siparişlerinizde hızlıca seçebileceğiniz adresler ekleyin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {addresses.map((addr) => (
                  <div 
                    key={addr.id}
                    className="border border-slate-200 hover:border-slate-300 rounded-2xl p-4 bg-slate-50/30 hover:bg-white flex flex-col justify-between transition-all group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 font-display">
                          {getAddressIcon(addr.title)}
                          {addr.title}
                        </span>
                        <button 
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 transition-opacity p-1 cursor-pointer"
                          title="Adresi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium break-words">
                        {addr.address}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Address Form */}
            <div className="bg-slate-50/70 border border-slate-200/60 rounded-2xl p-4 mt-4">
              <h4 className="text-xs font-black text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-blue-600" /> Yeni Teslimat Adresi Ekle
              </h4>

              {addressMsg && (
                <div className="p-2.5 mb-3.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold">
                  {addressMsg}
                </div>
              )}

              {addressError && (
                <div className="p-2.5 mb-3.5 bg-red-50 border border-red-100 text-red-600 rounded-lg text-[11px] font-semibold">
                  {addressError}
                </div>
              )}

              <form onSubmit={handleAddAddress} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-slate-500 font-semibold mb-1">Adres Başlığı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Merkez Ofis, Depo, Evim"
                      value={newAddressTitle}
                      onChange={(e) => setNewAddressTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-500 font-semibold mb-1">Tam Adres Bilgisi</label>
                    <input
                      type="text"
                      required
                      placeholder="Mahalle, cadde, sokak, kapı no, ilçe ve şehir"
                      value={newAddressText}
                      onChange={(e) => setNewAddressText(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] px-4 py-2 rounded-lg flex items-center gap-1 transition-all uppercase tracking-wider cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adresi Kaydet
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Active Orders Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between font-display border-b border-slate-100 pb-2.5">
              <span className="flex items-center gap-1.5 text-orange-600">
                <Truck className="w-4.5 h-4.5" /> Aktif Siparişleriniz
              </span>
              <button onClick={fetchOrders} className="text-slate-400 hover:text-orange-600 transition-colors cursor-pointer">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </h3>

            {loadingOrders ? (
              <div className="text-center py-6 text-xs text-slate-500">Yükleniyor...</div>
            ) : orders.filter(o => ['pending', 'approved', 'shipping', 'pending_payment'].includes(o.status)).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Şu anda aktif veya bekleyen siparişiniz bulunmamaktadır.</div>
            ) : (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {orders
                  .filter(o => ['pending', 'approved', 'shipping', 'pending_payment'].includes(o.status))
                  .map((order) => {
                    const statusColors: any = {
                      pending_payment: 'bg-amber-100 text-amber-800 border-amber-200',
                      pending: 'bg-amber-100 text-amber-800 border-amber-200',
                      approved: 'bg-blue-100 text-blue-800 border-blue-200',
                      shipping: 'bg-purple-100 text-purple-800 border-purple-200'
                    };

                    const statusTexts: any = {
                      pending_payment: 'Ödeme Bekliyor (PayTR)',
                      pending: 'Onay Bekliyor',
                      approved: 'Sipariş Onaylandı',
                      shipping: 'Kargoya Verildi'
                    };

                    return (
                      <div
                        key={order.id}
                        className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 text-sm">Sipariş #{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[order.status] || 'bg-slate-100'}`}>
                              {statusTexts[order.status] || order.status}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium">Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')} {new Date(order.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                          <p className="text-slate-500 max-w-sm line-clamp-1">Kargo Adresi: <span className="text-slate-700">{order.shipping_address}</span></p>
                          <p className="text-[10px] text-emerald-600 font-bold uppercase">
                            Ödeme: {order.payment_method === 'cari' ? 'Cari Hesap' : 'Kredi Kartı / PayTR'}
                          </p>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end gap-2 shrink-0">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Toplam Tutar</span>
                            <span className="text-base font-black text-slate-900 font-display">
                              {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                            </span>
                          </div>
                          {order.status === 'shipping' && (
                            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-sm border border-indigo-100 font-bold flex items-center gap-1">
                              <Truck className="w-3 h-3" /> Yurtiçi Kargo: {2754800 + order.id}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Past Orders Section */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-1.5 font-display border-b border-slate-100 pb-2.5">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> Geçmiş Siparişleriniz
            </h3>

            {loadingOrders ? (
              <div className="text-center py-6 text-xs text-slate-500">Yükleniyor...</div>
            ) : orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">Henüz tamamlanmış veya iptal edilmiş bir siparişiniz bulunmuyor.</div>
            ) : (
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1">
                {orders
                  .filter(o => ['delivered', 'cancelled'].includes(o.status))
                  .map((order) => {
                    const statusColors: any = {
                      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      cancelled: 'bg-red-100 text-red-800 border-red-200'
                    };

                    const statusTexts: any = {
                      delivered: 'Teslim Edildi',
                      cancelled: 'İptal Edildi'
                    };

                    return (
                      <div
                        key={order.id}
                        className="border border-slate-100 bg-slate-50/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between gap-4"
                      >
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-800 text-sm">Sipariş #{order.id}</span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${statusColors[order.status] || 'bg-slate-100'}`}>
                              {statusTexts[order.status] || order.status}
                            </span>
                          </div>
                          <p className="text-slate-500 font-medium">Tarih: {new Date(order.created_at).toLocaleDateString('tr-TR')}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">
                            Ödeme: {order.payment_method === 'cari' ? 'Cari Hesap' : 'Kredi Kartı / PayTR'}
                          </p>
                        </div>

                        <div className="text-right flex flex-col justify-between items-end gap-2 shrink-0">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-bold uppercase">Tutar</span>
                            <span className="text-base font-black text-slate-900 font-display">
                              {Number(order.total_amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                            </span>
                          </div>
                          {order.status === 'delivered' && (
                            <span className="text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm border border-emerald-100 font-bold flex items-center gap-1">
                              <FileCheck className="w-3 h-3" /> Fatura Kesildi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
