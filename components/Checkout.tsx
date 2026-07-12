'use client';

import React from 'react';
import { CreditCard, ShoppingBag, Truck, Check, AlertCircle, Sparkles, Lock, RefreshCw, MapPin } from 'lucide-react';

interface CheckoutProps {
  cart: any[];
  user: any;
  onClearCart: () => void;
  onNavigate: (tab: string) => void;
  onAddNotification: (msg: string) => void;
  siteConfigs?: any;
}

export default function Checkout({
  cart,
  user,
  onClearCart,
  onNavigate,
  onAddNotification,
  siteConfigs
}: CheckoutProps) {
  const [shippingAddress, setShippingAddress] = React.useState(user?.address || '');
  const [phone, setPhone] = React.useState(user?.phone || '');
  const [email, setEmail] = React.useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState('');

  const [addresses, setAddresses] = React.useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = React.useState(false);
  const hasInitializedRef = React.useRef(false);

  // Cart logic
  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const [paytrToken, setPaytrToken] = React.useState('');
  const [shopierUrl, setShopierUrl] = React.useState('');
  const activeProvider = siteConfigs?.active_payment_provider || 'paytr';

  // Role-specific variables
  const isIndividual = user?.role === 'customer';
  const minLimit = isIndividual ? 200 : 1500;
  const hasShippingFee = isIndividual;
  const shippingFee = hasShippingFee ? 80 : 0;
  const finalTotal = cartTotal + shippingFee;

  // Fetch saved addresses of user on checkout mount
  React.useEffect(() => {
    const fetchAddresses = async () => {
      setLoadingAddresses(true);
      try {
        const res = await fetch('/api/addresses');
        const data = await res.json();
        if (data.success && data.addresses) {
          setAddresses(data.addresses);
          // Auto select first address if field is empty
          if (data.addresses.length > 0 && !hasInitializedRef.current) {
            setShippingAddress((prev: string) => {
              if (!prev) {
                return data.addresses[0].address;
              }
              return prev;
            });
            hasInitializedRef.current = true;
          }
        }
      } catch (err) {
        console.error('Fetch addresses error in Checkout:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    if (user) {
      fetchAddresses();
    }
  }, [user]);

  // Submit order dynamically
  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (cartTotal < minLimit) {
      setErrorMsg(`Sipariş verebilmek için sepet toplamı minimum ${minLimit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL olmalıdır.`);
      return;
    }

    if (!shippingAddress.trim() || !phone.trim() || !email.trim()) {
      setErrorMsg('Lütfen kargo ve irtibat bilgilerini eksiksiz doldurun.');
      return;
    }

    const method = isIndividual ? 'paytr' : 'cari';
    executeOrderCreation(method);
  };

  const executeOrderCreation = async (method: 'cari' | 'paytr') => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod: method,
          shippingAddress,
          phone,
          email
        })
      });

      const data = await res.json();
      if (data.success) {
        if (data.paymentMethod === 'paytr') {
          // Fetch PayTR secure token for standard iframe payment
          const tokenRes = await fetch('/api/payments/paytr/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: data.orderId })
          });
          const tokenData = await tokenRes.json();
          if (tokenData.success) {
            setPaytrToken(tokenData.token);
            onAddNotification('PayTR güvenli ödeme penceresi yüklendi.');
            onClearCart(); // Cart is cleared since order is securely created as pending_payment
          } else {
            setErrorMsg(tokenData.error || 'PayTR entegrasyon hatası oluştu. Lütfen tekrar deneyin.');
          }
        } else if (data.paymentMethod === 'shopier') {
          setShopierUrl(`/api/payments/shopier/pay?orderId=${data.orderId}`);
          onAddNotification('Shopier güvenli ödeme penceresi yüklendi.');
          onClearCart();
        } else {
          onClearCart();
          alert(data.message);
          onNavigate('profile'); // Send to profile to see order
        }
      } else {
        setErrorMsg(data.error);
      }
    } catch (e: any) {
      setErrorMsg(`Hata: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="text-center py-16 bg-white border rounded-2xl max-w-lg mx-auto p-8 shadow-xs">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-800">Sepetiniz Boş</h3>
        <p className="text-slate-500 text-sm mt-1">Ödeme aşamasına geçebilmek için sepetinize en az bir ürün eklemeli veya sepetinizi güncellemelisiniz.</p>
        <button
          onClick={() => onNavigate('products')}
          className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg cursor-pointer transition-colors"
        >
          Alışverişe Başla
        </button>
      </div>
    );
  }

  if (paytrToken) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-blue-600" /> 3D Secure Güvenli Ödeme Sayfası
            </h3>
            <p className="text-slate-500 text-xs mt-1">Ödemeniz PayTR altyapısıyla 256-bit SSL güvenlik protokolü ile korunmaktadır.</p>
          </div>
          <button
            onClick={() => setPaytrToken('')}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
          >
            Ödeme Yöntemini Değiştir / Geri Dön
          </button>
        </div>

        <div className="relative min-h-[600px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <iframe
            src={`https://www.paytr.com/odeme/guvenli/${paytrToken}`}
            className="w-full h-[650px] border-0 bg-white"
            id="paytriframe"
            title="PayTR Secure Payment Frame"
          />
        </div>
      </div>
    );
  }

  if (shopierUrl) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-display">
              <Lock className="w-5 h-5 text-violet-600" /> Shopier Güvenli Ödeme Sayfası
            </h3>
            <p className="text-slate-500 text-xs mt-1">Ödemeniz Shopier altyapısıyla 256-bit SSL güvenlik protokolü ile korunmaktadır.</p>
          </div>
          <button
            onClick={() => setShopierUrl('')}
            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer"
          >
            Ödeme Yöntemini Değiştir / Geri Dön
          </button>
        </div>

        <div className="relative min-h-[600px] w-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <iframe
            src={shopierUrl}
            className="w-full h-[650px] border-0 bg-white"
            id="shopieriframe"
            title="Shopier Secure Payment Frame"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Checkout Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2 font-display">
            <Truck className="w-5 h-5 text-blue-600" /> Kargo ve Teslimat Bilgileri
          </h3>

          {errorMsg && (
            <div className="p-3 mb-4 bg-red-50 border border-red-100 text-red-600 rounded-lg text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleInitiateOrder} className="space-y-5 text-xs text-slate-700">
            {/* Saved Address Selector */}
            {addresses.length > 0 && (
              <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <label className="block font-bold text-slate-700 text-[11px] uppercase tracking-wider">
                  Kayıtlı Teslimat Adresleriniz
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {addresses.map((addr) => {
                    const isSelected = shippingAddress === addr.address;
                    return (
                      <button
                        type="button"
                        key={addr.id}
                        onClick={() => setShippingAddress(addr.address)}
                        className={`text-left p-3.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                          isSelected 
                            ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-500' 
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="font-bold text-slate-800 block mb-0.5">{addr.title}</span>
                          <span className="text-slate-600 line-clamp-2 text-[11px] leading-snug">{addr.address}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                {addresses.length > 0 ? 'Farklı Bir Adres Girin veya Seçili Adresi Düzenleyin' : 'Teslimat & Fatura Adresi'}
              </label>
              <textarea
                required
                rows={3}
                placeholder="Ör: Cumhuriyet Mah. Vatan Cad. No:12 Daire:4 Şişli / İstanbul"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  required
                  placeholder="0555 555 55 55"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  required
                  placeholder="örnek@firma.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {isIndividual ? (
              activeProvider === 'shopier' ? (
                <div className="mt-6 pt-5 border-t border-slate-100 bg-violet-50/40 p-4 border border-violet-100 rounded-xl">
                  <h4 className="font-bold text-violet-800 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    <CreditCard className="w-4 h-4 text-violet-600" /> Kredi Kartı ile Güvenli Ödeme (Shopier)
                  </h4>
                  <p className="text-violet-700 text-[11px] leading-relaxed">
                    Ödemenizi tüm kredi kartları ile Shopier altyapısı ve güvencesiyle kolayca yapabilirsiniz. Siparişiniz ödeme sonrası hemen kargoya hazırlanır.
                  </p>
                </div>
              ) : (
                <div className="mt-6 pt-5 border-t border-slate-100 bg-blue-50/40 p-4 border border-blue-100 rounded-xl">
                  <h4 className="font-bold text-blue-800 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-1">
                    <CreditCard className="w-4 h-4 text-blue-600" /> Kredi Kartı ile Güvenli Ödeme (PayTR)
                  </h4>
                  <p className="text-blue-700 text-[11px] leading-relaxed">
                    Ödemenizi tüm banka ve kredi kartları ile 3D Secure güvencesiyle tek çekim veya taksitli olarak güvenle yapabilirsiniz. Siparişiniz ödeme sonrası hemen kargoya hazırlanır.
                  </p>
                </div>
              )
            ) : (
              <div className="mt-6 pt-5 border-t border-slate-100 bg-emerald-50/40 p-4 border border-emerald-100 rounded-xl">
                <h4 className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 uppercase tracking-wider mb-1">
                  <Sparkles className="w-4 h-4 text-emerald-600" /> B2B Kurumsal Cari Hesap Ödemesi
                </h4>
                <p className="text-emerald-700 text-[11px] leading-relaxed">
                  Bu sipariş kurumsal cari hesabınız kapsamında oluşturulacaktır. Siparişiniz onaylandıktan sonra faturası kurumsal hesabınıza işlenecek ve size sevk edilecektir.
                </p>
              </div>
            )}

            {cartTotal < minLimit && (
              <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl space-y-1">
                <p className="font-bold flex items-center gap-1.5">⚠️ Sipariş Limiti Yetersiz</p>
                <p className="text-[11px]">
                  Sipariş verebilmek için sepet toplamınızın en az <span className="font-bold">{minLimit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span> olması gerekmektedir. Lütfen sepetinize daha fazla ürün ekleyin.
                </p>
                <p className="text-[11px] font-semibold">Eksik Tutar: {(minLimit - cartTotal).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || cartTotal < minLimit}
              className={`mt-6 w-full font-bold text-xs py-3 rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer ${
                cartTotal < minLimit
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isIndividual
                    ? activeProvider === 'shopier'
                      ? 'bg-violet-600 hover:bg-violet-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSubmitting 
                ? (isIndividual ? 'Ödeme Penceresi Hazırlanıyor...' : 'Siparişiniz Alınıyor...') 
                : (isIndividual ? `Güvenli Ödeme Yap (${activeProvider === 'shopier' ? 'Shopier' : 'PayTR'})` : 'Kurumsal Siparişi Tamamla')}
            </button>
          </form>
        </div>
      </div>

      {/* Cart Summary Panel */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 self-start space-y-4">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2.5 flex items-center justify-between">
          <span>Sipariş Özeti</span>
          <span className="text-xs text-slate-400 font-medium">{cart.length} Ürün</span>
        </h3>

        <div className="space-y-3.5 max-h-52 overflow-y-auto text-xs pr-1">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800 line-clamp-1">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.quantity} Adet x {Number(item.price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</p>
              </div>
              <span className="font-bold text-slate-700 shrink-0">
                {Number(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
              </span>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
          <div className="flex justify-between">
            <span>Ara Toplam:</span>
            <span>{cartTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
          </div>
          <div className="flex justify-between">
            <span>Kargo Ücreti:</span>
            {hasShippingFee ? (
              <span className="text-slate-800 font-bold">{shippingFee.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
            ) : (
              <span className="text-emerald-600 font-bold">Ücretsiz Kargo</span>
            )}
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-2.5 font-bold text-slate-800 text-sm">
            <span>Ödenecek Tutar:</span>
            <span className="text-slate-900 text-base font-black">
              {finalTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
