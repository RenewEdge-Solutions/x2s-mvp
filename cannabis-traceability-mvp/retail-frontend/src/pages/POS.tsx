import React, { useMemo, useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { Barcode, ShoppingCart, Trash2, Percent, CreditCard, Receipt, UserCheck, Printer, CircleCheck, Circle, AlertTriangle, CheckCircle2, Minus, Plus } from 'lucide-react';

type Product = {
  id: string;
  sku: string;
  name: string;
  category: 'Flower' | 'Pre-roll' | 'Edible' | 'Oil' | 'Topical' | 'Accessory';
  price: number;
  thc?: number;
  cbd?: number;
  stock: number;
  image?: string;
};

type CartLine = { product: Product; qty: number; discountPct?: number };

const productImage = (sku: string) => `/images/products/${sku}.jpg`;

const catalog: Product[] = [
  { id: 'sku-1001', sku: 'FLOW-35G-BD', name: 'Blue Dream 3.5g', category: 'Flower', price: 35, thc: 20.5, cbd: 0.2, stock: 42, image: productImage('FLOW-35G-BD') },
  { id: 'sku-1002', sku: 'FLOW-7G-OG', name: 'OG Kush 7g', category: 'Flower', price: 60, thc: 22.1, cbd: 0.3, stock: 18, image: productImage('FLOW-7G-OG') },
  { id: 'sku-1003', sku: 'FLOW-35G-SD', name: 'Sour Diesel 3.5g', category: 'Flower', price: 34, thc: 21.0, cbd: 0.2, stock: 33, image: productImage('FLOW-35G-SD') },
  { id: 'sku-1004', sku: 'FLOW-35G-GE', name: 'Gelato 3.5g', category: 'Flower', price: 36, thc: 23.1, cbd: 0.2, stock: 27, image: productImage('FLOW-35G-GE') },
  { id: 'sku-1005', sku: 'FLOW-35G-WC', name: 'Wedding Cake 3.5g', category: 'Flower', price: 38, thc: 24.0, cbd: 0.2, stock: 21, image: productImage('FLOW-35G-WC') },
  { id: 'sku-2001', sku: 'PR-1G-GG', name: 'Pre-roll 1g Gorilla Glue', category: 'Pre-roll', price: 10, thc: 19.0, cbd: 0.1, stock: 120, image: productImage('PR-1G-GG') },
  { id: 'sku-2002', sku: 'PR-05G-2PK', name: 'Pre-roll 0.5g (2-pack)', category: 'Pre-roll', price: 12, thc: 18.2, stock: 140, image: productImage('PR-05G-2PK') },
  { id: 'sku-2003', sku: 'PR-1G-IND', name: 'Pre-roll 1g Indica', category: 'Pre-roll', price: 11, thc: 20.0, stock: 95, image: productImage('PR-1G-IND') },
  { id: 'sku-3001', sku: 'ED-CHOC-10', name: 'Chocolate 10mg (10ct)', category: 'Edible', price: 22, stock: 35, image: productImage('ED-CHOC-10') },
  { id: 'sku-3002', sku: 'ED-GUM-10', name: 'Gummies 10mg (10ct)', category: 'Edible', price: 20, stock: 60, image: productImage('ED-GUM-10') },
  { id: 'sku-3003', sku: 'ED-CAR-05', name: 'Caramels 5mg (20ct)', category: 'Edible', price: 24, stock: 28, image: productImage('ED-CAR-05') },
  { id: 'sku-4001', sku: 'OIL-1ML-THC', name: 'Oil Tincture 1ml (THC)', category: 'Oil', price: 48, thc: 25.0, stock: 12, image: productImage('OIL-1ML-THC') },
  { id: 'sku-4002', sku: 'OIL-1ML-CBD', name: 'Oil Tincture 1ml (CBD)', category: 'Oil', price: 42, cbd: 30.0, stock: 18, image: productImage('OIL-1ML-CBD') },
  { id: 'sku-4003', sku: 'OIL-1ML-BAL', name: 'Balanced 1:1 1ml', category: 'Oil', price: 45, thc: 15.0, cbd: 15.0, stock: 15, image: productImage('OIL-1ML-BAL') },
  { id: 'sku-6001', sku: 'TOP-BALM-50', name: 'Relief Balm 50ml', category: 'Topical', price: 25, stock: 22, image: productImage('TOP-BALM-50') },
  { id: 'sku-6002', sku: 'TOP-GEL-100', name: 'Cooling Gel 100ml', category: 'Topical', price: 28, stock: 16, image: productImage('TOP-GEL-100') },
  { id: 'sku-5001', sku: 'ACC-GRINDER', name: 'Aluminum Grinder', category: 'Accessory', price: 15, stock: 20, image: productImage('ACC-GRINDER') },
  { id: 'sku-5002', sku: 'ACC-PAPERS', name: 'Papers King Size', category: 'Accessory', price: 4, stock: 210, image: productImage('ACC-PAPERS') },
  { id: 'sku-5003', sku: 'ACC-PIPE', name: 'Glass Pipe Mini', category: 'Accessory', price: 18, stock: 32, image: productImage('ACC-PIPE') },
];

export default function POS() {
  const [scan, setScan] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [productCategory, setProductCategory] = useState<'All' | Product['category']>('All');
  const [cart, setCart] = useState<CartLine[]>([]);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [customerType, setCustomerType] = useState<'Adult-use' | 'Medical' | null>(null);
  const [idScan, setIdScan] = useState('');
  const [dob, setDob] = useState('');
  const [idVerified, setIdVerified] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [taxPct] = useState(10);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<null | 'Cash' | 'Card'>(null);
  const [cashReceived, setCashReceived] = useState<number | ''>('');
  const [cardApproved, setCardApproved] = useState(false);

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const gridRef = useRef<HTMLDivElement | null>(null);
  const [productGridMaxH, setProductGridMaxH] = useState<number | null>(null);
  const cartListRef = useRef<HTMLDivElement | null>(null);
  const [cartListMaxH, setCartListMaxH] = useState<number | null>(null);
  useEffect(() => {
    const measure = () => {
      const grid = gridRef.current;
      if (!grid) return;
      const firstItem = grid.querySelector('button');
      if (!firstItem) return;
      const itemH = (firstItem as HTMLElement).offsetHeight;
      const styles = getComputedStyle(grid);
      const rowGap = parseFloat((styles.rowGap || '0').toString()) || 0;
      const rows = 3;
      const maxH = Math.round(itemH * rows + rowGap * (rows - 1));
      if (!Number.isNaN(maxH) && maxH > 0) setProductGridMaxH(maxH);

    // Measure cart list for exactly 8 visible items
      const list = cartListRef.current;
      if (list) {
        const items = list.querySelectorAll('.cart-line');
        if (items.length > 0) {
          const item0 = items[0] as HTMLElement;
          const itemH2 = item0.offsetHeight;
          const gap = items.length > 1 ? parseFloat(getComputedStyle(items[1] as HTMLElement).marginTop || '8') || 8 : 8;
      const rows2 = 8;
          const maxH2 = Math.round(itemH2 * rows2 + gap * (rows2 - 1));
          if (!Number.isNaN(maxH2) && maxH2 > 0) setCartListMaxH(maxH2);
        }
      }
    };
    measure();
    const t1 = window.setTimeout(measure, 60);
    const t2 = window.setTimeout(measure, 220);
    const onResize = () => { measure(); };
    window.addEventListener('resize', onResize);
    const ro = 'ResizeObserver' in window ? new ResizeObserver(measure) : null;
    if (ro && gridRef.current) ro.observe(gridRef.current);
    return () => {
      window.removeEventListener('resize', onResize);
      if (ro) ro.disconnect();
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [productQuery, productCategory, cart.length]);

  const addBySku = (sku: string) => {
    const p = catalog.find((x) => x.sku.toLowerCase() === sku.toLowerCase());
    if (!p) return;
    setCart((prev) => {
      const idx = prev.findIndex((l) => l.product.id === p.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Math.min(next[idx].qty + 1, p.stock) };
        return next;
      }
      return [...prev, { product: p, qty: 1 }];
    });
    setScan('');
  };

  const removeLine = (id: string) => setCart((prev) => prev.filter((l) => l.product.id !== id));

  const totals = useMemo(() => {
    const subtotal = cart.reduce((s, l) => s + l.product.price * l.qty * (1 - (l.discountPct ?? 0) / 100), 0);
    const tax = +(subtotal * (taxPct / 100)).toFixed(2);
    const total = +(subtotal + tax).toFixed(2);
    return { subtotal: +subtotal.toFixed(2), tax, total };
  }, [cart, taxPct]);

  const limitWarning = useMemo(() => {
    const gramEq = cart.reduce((g, l) => {
      if (l.product.category === 'Flower') {
        const m = l.product.name.match(/(\d+(?:\.\d+)?)g/);
        const grams = m ? parseFloat(m[1]) : 1;
        return g + grams * l.qty;
      }
      if (l.product.category === 'Pre-roll') return g + 1 * l.qty;
      return g;
    }, 0);
    const limit = customerType === 'Medical' ? 56 : 28;
    return gramEq > limit ? `Purchase limit exceeded (${gramEq}g > ${limit}g)` : null;
  }, [cart, customerType]);

  const checkout = async () => {
    if (!idVerified) return alert('Verify age/ID before completing sale.');
    if (cart.length === 0) return;
    if (limitWarning) return alert(limitWarning);
    if (!paymentMethod) return alert('Select a payment method.');
    if (paymentMethod === 'Cash' && (typeof cashReceived !== 'number' || cashReceived < totals.total)) {
      return alert('Cash received is less than total due.');
    }
    if (paymentMethod === 'Card' && !cardApproved) {
      return alert('Card not approved yet.');
    }
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 900));
    setProcessing(false);
    setStep(4);
  };

  const resetSale = () => {
    setScan('');
    setCart([]);
    setCustomerType(null);
    setIdScan('');
    setDob('');
    setIdVerified(false);
    setPatientId('');
    setStep(1);
    setPaymentMethod(null);
    setCashReceived('');
    setCardApproved(false);
  };

  const canProceedFromItems = cart.length > 0;
  const canProceedFromCustomer = idVerified && !!customerType;

  const onVerifyId = () => {
    if (!dob) { setIdVerified(false); return; }
    const d = new Date(dob);
    if (isNaN(d.getTime())) { setIdVerified(false); return; }
    const now = new Date();
    const eighteenYears = 18 * 365.25 * 24 * 3600 * 1000;
    setIdVerified(now.getTime() - d.getTime() >= eighteenYears);
  };

  const handlePrintReceipt = () => {
    const esc = (str: string) => String(str).replace(/[&<>"']/g, (s) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[s] as string));
    const nowStr = new Date().toLocaleString();
    const orderNo = Math.floor(Date.now() / 1000);

    const rows = cart.map((l) => {
      const line = l.product.price * l.qty * (1 - (l.discountPct ?? 0) / 100);
      const note = l.discountPct ? ` • ${l.discountPct}% off` : '';
      return `<tr>
        <td class="w"><div class="n">${esc(l.product.name)}</div><div class="s">${esc(l.product.sku)}${note}</div></td>
        <td class="r">${l.qty}</td>
        <td class="r">$${l.product.price.toFixed(2)}</td>
        <td class="r">$${line.toFixed(2)}</td>
      </tr>`;
    }).join('');

    const paySummary = paymentMethod === 'Cash' && typeof cashReceived === 'number' && cashReceived > 0
      ? `Cash $${cashReceived.toFixed(2)}`
      : paymentMethod === 'Card' ? `Card${cardApproved ? ' • Approved' : ''}` : '—';

    const changeLine = paymentMethod === 'Cash' && typeof cashReceived === 'number' && cashReceived > totals.total
      ? `<div class="line"><span>Change</span><span>$${(cashReceived - totals.total).toFixed(2)}</span></div>`
      : '';

    const style = document.createElement('style');
    style.setAttribute('data-print-style', 'true');
    style.textContent = `
      @page { size: 80mm auto; margin: 5mm; }
      @media print { body > *:not(#_print_root_) { display: none !important; } #_print_root_ { display: block !important; } }
      #_print_root_ { display: none; }
      #_print_root_ .rec { width: 72mm; margin: 0 auto; color: #111; font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }
      #_print_root_ .center { text-align: center; }
      #_print_root_ .muted { color: #555; }
      #_print_root_ .hr { border-top: 1px dashed #999; margin: 6px 0; }
      #_print_root_ table { width: 100%; border-collapse: collapse; }
      #_print_root_ th, #_print_root_ td { padding: 4px 0; vertical-align: top; }
      #_print_root_ th { text-align: left; color: #444; }
      #_print_root_ .r { text-align: right; white-space: nowrap; }
      #_print_root_ .w { width: 100%; }
      #_print_root_ .n { font-weight: 600; }
      #_print_root_ .s { font-size: 11px; color: #555; }
      #_print_root_ .line { display: flex; justify-content: space-between; padding: 2px 0; }
      #_print_root_ .grand { font-weight: 700; }
      #_print_root_ .tiny { font-size: 11px; }
    `;

    const root = document.createElement('div');
    root.id = '_print_root_';
    root.innerHTML = `
      <div class="rec">
        <div class="center"><div class="n">Traceability Dispensary</div><div class="tiny muted">123 Retail Blvd, Castries • (758) 555-1234</div></div>
        <div class="hr"></div>
        <div class="line tiny"><span>Order #${orderNo}</span><span>${nowStr}</span></div>
        <div class="line tiny"><span>Customer:</span><span>${esc(customerType || '—')}</span></div>
        <div class="line tiny"><span>Payment:</span><span>${esc(paySummary)}</span></div>
        <div class="hr"></div>
        <table><thead><tr><th>Item</th><th class="r">Qty</th><th class="r">Price</th><th class="r">Total</th></tr></thead><tbody>${rows}</tbody></table>
        <div class="hr"></div>
        <div class="line tiny"><span>Subtotal</span><span>$${totals.subtotal.toFixed(2)}</span></div>
        <div class="line tiny"><span>Tax</span><span>$${totals.tax.toFixed(2)}</span></div>
        <div class="line grand"><span>Total</span><span>$${totals.total.toFixed(2)}</span></div>
        ${changeLine}
        <div class="hr"></div>
        <div class="center tiny muted">Thank you for your purchase</div>
      </div>`;

    const cleanup = () => {
      try { document.head.removeChild(style); } catch {}
      try { document.body.removeChild(root); } catch {}
      window.removeEventListener('afterprint', cleanup as any);
    };

    document.head.appendChild(style);
    document.body.appendChild(root);
    window.addEventListener('afterprint', cleanup as any, { once: true } as any);
    setTimeout(() => { window.print(); setTimeout(cleanup, 2000); }, 50);
  };

  const categories = useMemo<Array<'All' | Product['category']>>(() => ['All', ...Array.from(new Set(catalog.map(c => c.category)))], []);
  const filteredCatalog = useMemo(() => {
    const v = productQuery.trim().toLowerCase();
    return catalog.filter(p => {
      const byC = productCategory === 'All' ? true : p.category === productCategory;
      const byQ = v ? `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(v) : true;
      return byC && byQ;
    });
  }, [productQuery, productCategory]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 inline-flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-emerald-600" aria-hidden /> POS
        </h1>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          {[{k:1,label:'Scan items',icon:<Barcode className="h-4 w-4"/>},{k:2,label:'Customer',icon:<UserCheck className="h-4 w-4"/>},{k:3,label:'Payment',icon:<CreditCard className="h-4 w-4"/>},{k:4,label:'Receipt',icon:<Receipt className="h-4 w-4"/>}].map(s => (
            <div key={s.k} className="flex-1 flex items-center">
              <div className={`flex items-center gap-2 px-2 py-1 rounded-md text-sm ${step===s.k ? 'text-emerald-700 bg-emerald-50' : step>s.k ? 'text-emerald-600' : 'text-gray-600'}`}>
                {step> s.k ? <CircleCheck className="h-4 w-4"/> : <Circle className="h-4 w-4"/>}
                {s.icon}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
              {s.k<4 && <div className={`flex-1 h-0.5 mx-2 ${step> s.k ? 'bg-emerald-200' : 'bg-gray-200'}`}/>} 
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" title="Products" subtitle="Scan a barcode or search and filter to add">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-md border border-gray-300 px-2 py-1 w-full sm:w-80">
              <Barcode className="h-4 w-4 text-gray-400" aria-hidden />
              <input value={scan} onChange={(e) => setScan(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addBySku(scan)} placeholder="Scan or enter SKU (e.g. FLOW-35G-BD)" className="w-full text-sm outline-none" />
              <button className="text-xs text-gray-700 hover:underline" onClick={() => addBySku(scan)}>Add</button>
            </div>
          </div>
          <div className="mb-3 flex items-center gap-2">
            <input value={productQuery} onChange={(e)=>setProductQuery(e.target.value)} placeholder="Search products by name or SKU" className="w-full sm:w-80 rounded-md border border-gray-300 px-2 py-1 text-sm" />
            <select className="rounded-md border border-gray-300 px-2 py-1 text-sm" value={productCategory} onChange={(e)=>setProductCategory(e.target.value as any)}>
              {categories.map(c => (<option key={c}>{c}</option>))}
            </select>
            {(productQuery || productCategory !== 'All') && (
              <button className="text-sm text-gray-700 hover:underline" onClick={()=>{ setProductQuery(''); setProductCategory('All'); }}>Clear</button>
            )}
          </div>
          <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-auto pr-1" style={{ maxHeight: productGridMaxH ? `${productGridMaxH}px` : '28rem' }}>
            {filteredCatalog.map((p) => (
              <button key={p.id} className="rounded-lg border border-gray-200 text-left hover:bg-gray-50 overflow-hidden" onClick={() => addBySku(p.sku)}>
                {p.image && (
                  <div className="w-full aspect-[4/3] bg-gray-100 overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                )}
                <div className="p-3">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.sku} • {p.category}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="text-gray-900 font-semibold">${p.price.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">Stock: {p.stock}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card title={step === 1 ? 'Cart' : step === 2 ? 'Customer' : step === 3 ? 'Payment' : 'Receipt'} subtitle={step === 1 ? 'Current transaction' : step === 2 ? 'Verify and select type' : step === 3 ? 'Take payment' : 'Summary'}>
          {step === 1 && (
            <>
              {cart.length === 0 ? (
                <div className="text-sm text-gray-600">No items yet.</div>
              ) : (
                <div ref={cartListRef} className={`space-y-2 ${cart.length > 8 ? 'overflow-y-auto pr-1' : ''}`} style={{ maxHeight: cart.length > 8 && cartListMaxH ? `${cartListMaxH}px` : undefined }}>
                  {cart.map((l) => (
                    <div key={l.product.id} className="cart-line flex items-start justify-between gap-2 rounded-md border border-gray-200 p-2">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">{l.product.name}</div>
                        <div className="text-xs text-gray-500">{l.product.sku} • ${l.product.price.toFixed(2)} ea</div>
                        <div className="mt-1 flex items-center gap-3 text-xs">
                          {/* Qty stepper */}
                          <div className="inline-flex items-center whitespace-nowrap rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden divide-x divide-gray-200">
                            <button className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40" onClick={() => setCart(prev => prev.map(x => x.product.id === l.product.id ? { ...x, qty: Math.max(1, l.qty - 1) } : x))} disabled={l.qty <= 1} aria-label="Decrease quantity">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={l.product.stock}
                              value={l.qty}
                              onChange={(e) => {
                                const v = Math.max(1, Math.min(Number(e.target.value || 1), l.product.stock));
                                setCart((prev) => prev.map((x) => (x.product.id === l.product.id ? { ...x, qty: v } : x)));
                              }}
                              className="w-12 text-center outline-none border-0 text-sm"
                              aria-label="Quantity"
                            />
                            <button className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40" onClick={() => setCart(prev => prev.map(x => x.product.id === l.product.id ? { ...x, qty: Math.min(l.product.stock, l.qty + 1) } : x))} disabled={l.qty >= l.product.stock} aria-label="Increase quantity">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Discount control */}
                          <div className="inline-flex items-center whitespace-nowrap rounded-md border border-gray-300 bg-white shadow-sm overflow-hidden divide-x divide-gray-200">
                            <button className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40" onClick={() => setCart(prev => prev.map(x => x.product.id === l.product.id ? { ...x, discountPct: Math.max(0, (l.discountPct ?? 0) - 5) } : x))} disabled={(l.discountPct ?? 0) <= 0} aria-label="Decrease discount">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <div className="px-1 text-gray-500 shrink-0"><Percent className="h-3.5 w-3.5" aria-hidden /></div>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={l.discountPct ?? 0}
                              onChange={(e) => {
                                const v = Math.max(0, Math.min(100, Number(e.target.value || 0)));
                                setCart((prev) => prev.map((x) => (x.product.id === l.product.id ? { ...x, discountPct: v } : x)));
                              }}
                              className="w-14 text-center outline-none border-0 text-sm"
                              aria-label="Discount percent"
                            />
                            <button className="px-2 py-1 text-gray-700 hover:bg-gray-50 disabled:opacity-40" onClick={() => setCart(prev => prev.map(x => x.product.id === l.product.id ? { ...x, discountPct: Math.min(100, (l.discountPct ?? 0) + 5) } : x))} disabled={(l.discountPct ?? 0) >= 100} aria-label="Increase discount">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">${(l.product.price * l.qty * (1 - (l.discountPct ?? 0) / 100)).toFixed(2)}</div>
                        <button className="mt-2 inline-flex items-center gap-1 text-xs text-rose-600 hover:underline" onClick={() => removeLine(l.product.id)}>
                          <Trash2 className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Tax ({taxPct}%)</span><span>${totals.tax.toFixed(2)}</span></div>
                <div className="flex items-center justify-between font-semibold text-gray-900"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
              </div>

              {limitWarning && (<div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800">{limitWarning}</div>)}

              <div className="mt-3 flex items-center justify-end">
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60" disabled={!canProceedFromItems} onClick={() => setStep(2)}>
                  <UserCheck className="h-4 w-4" aria-hidden /> Continue to customer
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-3">
                <div className="text-sm text-gray-700">Scan or enter customer ID and date of birth.</div>
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-sm col-span-2 sm:col-span-1"><span className="block text-gray-700 mb-1">ID scan / number</span>
                    <input value={idScan} onChange={(e)=>setIdScan(e.target.value)} className="w-full rounded-md border-gray-300" placeholder="e.g. 9900-123-456" />
                  </label>
                  <label className="text-sm col-span-2 sm:col-span-1"><span className="block text-gray-700 mb-1">Date of birth</span>
                    <input type="date" value={dob} max={maxDob} onChange={(e)=>{ setDob(e.target.value); }} onBlur={onVerifyId} className="w-full rounded-md border-gray-300" />
                  </label>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <label className="inline-flex items-center gap-2"><input type="radio" name="ctype" checked={customerType === 'Adult-use'} onChange={()=>setCustomerType('Adult-use')} /> Adult-use</label>
                  <label className="inline-flex items-center gap-2"><input type="radio" name="ctype" checked={customerType === 'Medical'} onChange={()=>setCustomerType('Medical')} /> Medical</label>
                </div>
                {customerType === 'Medical' && (
                  <label className="text-sm"><span className="block text-gray-700 mb-1">Patient card / registry ID</span>
                    <input value={patientId} onChange={(e)=>setPatientId(e.target.value)} className="w-full rounded-md border-gray-300" placeholder="MED-123456" />
                  </label>
                )}
                <div className={`inline-flex items-center gap-2 text-sm ${idVerified ? 'text-emerald-700' : 'text-amber-700'}`}>
                  <UserCheck className={`h-4 w-4 ${idVerified ? 'text-emerald-600' : 'text-amber-600'}`} />
                  {idVerified ? 'ID verified • 18+ confirmed' : 'Awaiting ID/DOB verification'}
                </div>

                <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 p-2">
                  <div className="text-xs font-semibold text-gray-700 mb-1 inline-flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600"/> Compliance tips</div>
                  <ul className="text-sm text-gray-700 list-disc pl-5 space-y-0.5">
                    <li>Verify age/ID for all customers.</li>
                    <li>Respect purchase limits by product class.</li>
                    <li>Log returns and destructions where applicable.</li>
                    <li>Include batch/lot on the receipt when required.</li>
                  </ul>
                  {limitWarning && (<div className="mt-2 rounded border border-amber-300 bg-amber-50 text-amber-800 text-xs px-2 py-1 inline-flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5"/> {limitWarning}</div>)}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={()=>setStep(1)}>Back</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60" disabled={!canProceedFromCustomer} onClick={()=>setStep(3)}>
                  <CreditCard className="h-4 w-4" aria-hidden /> Continue to payment
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-sm text-gray-700">Take payment and finalize the sale.</div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex items-center justify-between"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between"><span>Tax ({taxPct}%)</span><span>${totals.tax.toFixed(2)}</span></div>
                <div className="flex items-center justify-between font-semibold text-gray-900"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 ${paymentMethod==='Cash' ? 'border-emerald-600 text-emerald-700' : 'border-gray-300'}`} onClick={() => { setPaymentMethod('Cash'); setCardApproved(false); }}>Cash</button>
                <button className={`inline-flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 ${paymentMethod==='Card' ? 'border-emerald-600 text-emerald-700' : 'border-gray-300'}`} onClick={async () => {
                  setPaymentMethod('Card');
                  setCashReceived('');
                  setCardApproved(false);
                  setProcessing(true);
                  await new Promise(r=>setTimeout(r, 1200));
                  setProcessing(false);
                  setCardApproved(true);
                }}>Card</button>
              </div>
              {paymentMethod === 'Cash' && (
                <div className="mt-3 rounded-md border border-gray-200 p-2">
                  <div className="text-sm text-gray-700 mb-2">Enter cash received to compute change.</div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm inline-flex items-center gap-2"><span>Cash received</span>
                      <input type="number" className="w-32 rounded-md border-gray-300" value={cashReceived as any} onChange={(e)=>setCashReceived(e.target.value===''? '' : Number(e.target.value))} />
                    </label>
                    {typeof cashReceived === 'number' && cashReceived >= totals.total && (
                      <div className="text-sm font-medium text-emerald-700">Change: ${(cashReceived - totals.total).toFixed(2)}</div>
                    )}
                  </div>
                </div>
              )}
              {paymentMethod === 'Card' && (
                <div className="mt-3 rounded-md border border-gray-200 p-2">
                  <div className="text-sm flex items-center gap-2">
                    {processing ? (<span className="text-gray-700">Processing card…</span>) : cardApproved ? (<span className="text-emerald-700 inline-flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Card approved</span>) : (<span className="text-gray-700">Ready for tap/insert</span>)}
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <button className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50" onClick={()=>setStep(2)}>Back</button>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60" onClick={checkout} disabled={processing || cart.length === 0 || !idVerified || !paymentMethod || (paymentMethod==='Cash' && (typeof cashReceived !== 'number' || cashReceived < totals.total)) || (paymentMethod==='Card' && !cardApproved)}>
                  {processing ? (<Receipt className="h-4 w-4 animate-pulse" aria-hidden />) : (<CreditCard className="h-4 w-4" aria-hidden />)} Complete sale
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="space-y-2 text-sm">
                <div className="text-gray-700">Sale completed. Receipt is ready to print.</div>
                <div id="receipt" className="bg-white rounded-lg border border-gray-200 p-4 max-w-2xl mx-auto print:max-w-full print:rounded-none print:border-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl font-semibold text-gray-900">Traceability Dispensary</div>
                      <div className="text-xs text-gray-600">123 Retail Blvd, Castries • (758) 555-1234</div>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <div>Order #: {Math.floor(Date.now()/1000)}</div>
                      <div>{new Date().toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-700">
                    <div><span className="text-gray-500">Customer type:</span> {customerType || '—'}</div>
                    <div><span className="text-gray-500">Payment:</span> {paymentMethod === 'Cash' && typeof cashReceived === 'number' && cashReceived > 0 ? `Cash ${cashReceived.toFixed(2)}` : paymentMethod === 'Card' ? `Card${cardApproved ? ' • Approved' : ''}` : '—'}</div>
                  </div>
                  <div className="mt-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-600 border-b border-gray-200"><th className="py-1">Item</th><th className="py-1 text-right">Qty</th><th className="py-1 text-right">Price</th><th className="py-1 text-right">Total</th></tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {cart.map(l => {
                          const line = l.product.price * l.qty * (1 - (l.discountPct ?? 0) / 100);
                          return (
                            <tr key={l.product.id}>
                              <td className="py-1"><div className="text-gray-900">{l.product.name}</div><div className="text-[11px] text-gray-500">{l.product.sku}{l.discountPct? ` • ${l.discountPct}% off`: ''}</div></td>
                              <td className="py-1 text-right">{l.qty}</td>
                              <td className="py-1 text-right">${l.product.price.toFixed(2)}</td>
                              <td className="py-1 text-right">${line.toFixed(2)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-2 border-t border-gray-200 pt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between text-sm"><span>Tax</span><span>${totals.tax.toFixed(2)}</span></div>
                    <div className="flex items-center justify-between text-base font-semibold text-gray-900"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
                    {paymentMethod==='Cash' && typeof cashReceived==='number' && cashReceived > totals.total && (<div className="flex items-center justify-between text-sm"><span>Change</span><span>${(cashReceived - totals.total).toFixed(2)}</span></div>)}
                  </div>
                  <div className="mt-3 text-center text-xs text-gray-600">Thank you for your purchase! • No returns without receipt • All sales logged for compliance</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50" onClick={handlePrintReceipt}>
                  <Printer className="h-4 w-4" aria-hidden /> Print receipt
                </button>
                <button className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700" onClick={resetSale}>New sale</button>
              </div>
            </>
          )}
        </Card>
      </div>

    </div>
  );
}
