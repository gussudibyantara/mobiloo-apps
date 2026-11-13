'use client';
import {LockedInvoiceButton} from './invoice-lock';
import Link from 'next/link';
import {activeBookingInvoice} from '@/lib/invoice-shared';
import {branchNames} from '@/lib/branches-shared';
import DateField from './date-field';
import { useEffect, useMemo, useState } from 'react';
import { ArrowDownUp, ArrowRight, CalendarDays, CarFront, ChevronLeft, ChevronRight, Download, Filter, Search, Wallet, X } from 'lucide-react';
import type { Booking, DashboardData } from '@/lib/types';
import { dateLabel, money, paymentStatus, period } from '@/lib/format';
import { overlaps } from '@/lib/rules';
import { addDays } from '@/lib/calendar';
import { Avatar, Badge, statusText, statusTone } from './rental-ui';
const tabs = [['all', 'Semua booking'], ['confirmed', 'Akan datang'], ['running', 'Berjalan'], ['returned', 'Dikembalikan'], ['completed', 'Selesai'], ['cancelled', 'Dibatalkan']] as const;
export default function BookingsPage({ data, branch, onBranch, onOpen, onEdit }: {
  data: DashboardData; branch: string; onBranch: (branch: string) => void; onOpen: (booking: Booking) => void; onEdit: (booking: Booking) => void;
}) {
  const [tab, setTab] = useState('all'), [query, setQuery] = useState(''), [payment, setPayment] = useState('all'), [category, setCategory] = useState('all');
  const [from, setFrom] = useState(''), [to, setTo] = useState(''), [sort, setSort] = useState('created'), [page, setPage] = useState(1);
  const invoiceLink=(booking:Booking)=>booking.status!=='cancelled'||activeBookingInvoice(data,booking.id)?<LockedInvoiceButton className="booking-invoice-status">Invoice</LockedInvoiceButton>:<span className="small-muted">Booking dibatalkan</span>;
  const [exportStatus, setExportStatus] = useState('');
  const base = useMemo(() => data.bookings.filter(b => branch === 'Semua cabang' || data.units.find(u => u.id === b.unitId)?.branch === branch), [data, branch]);
  const dateError = Boolean(from && to && from > to);
  const filtered = useMemo(() => {
    if (dateError) return [];
    return base.filter(b => {
      const unit = data.units.find(u => u.id === b.unitId)!, customer = data.customers.find(c => c.id === b.customerId)!;
      const text = `${b.id} ${customer.name} ${unit.name} ${unit.plate} ${b.pic}`.toLowerCase();
      const paid = b.paid >= b.total ? 'full' : b.paid > 0 ? 'partial' : 'unpaid';
      return (tab === 'all' || b.status === tab) && text.includes(query.toLowerCase().trim()) && (payment === 'all' || paid === payment) && (category === 'all' || unit.category === category)
        && (!from || +new Date(b.end) > +new Date(`${from}T00:00:00+08:00`)) && (!to || +new Date(b.start) < +new Date(`${addDays(to, 1)}T00:00:00+08:00`));
    }).sort((a, b) => sort === 'start' ? +new Date(a.start) - +new Date(b.start) : sort === 'total' ? b.total - a.total : +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [base, data, tab, query, payment, category, from, to, sort, dateError]);
  useEffect(() => { setPage(1); }, [tab, query, payment, category, from, to, branch, sort]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / 8)), currentPage = Math.min(page, totalPages), visible = filtered.slice((currentPage - 1) * 8, currentPage * 8);
  const activeFilters = Number(category !== 'all') + Number(payment !== 'all') + Number(Boolean(from || to)) + Number(branch !== 'Semua cabang');
  function reset() { setTab('all'); setQuery(''); setPayment('all'); setCategory('all'); setFrom(''); setTo(''); onBranch('Semua cabang'); }
  function exportCSV() {
    const escape = (value: string | number) => `"${String(value).replace(/^[\s]*[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const rows = [['Booking', 'Pelanggan', 'Kendaraan', 'Plat', 'Cabang', 'Mulai WITA', 'Selesai WITA', 'Status', 'Total', 'Dibayar', 'Sisa tagihan'], ...filtered.map(b => {
      const unit = data.units.find(u => u.id === b.unitId)!, customer = data.customers.find(c => c.id === b.customerId)!;
      return [b.id, customer.name, unit.name, unit.plate, unit.branch, dateLabel(b.start, { year: 'numeric', hour: '2-digit', minute: '2-digit' }), dateLabel(b.end, { year: 'numeric', hour: '2-digit', minute: '2-digit' }), statusText[b.status], b.total, b.paid, b.total - b.paid];
    })];
    const blob = new Blob(['\uFEFF' + rows.map(row => row.map(escape).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob), link = document.createElement('a'); link.href = url; link.download = 'TravelOS-bookings.csv'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setExportStatus(`${filtered.length} booking diekspor sesuai filter.`);
  }
  return <div className="module-page bookings-page">
    <div className="kpi-grid">
      <article className="kpi-card"><div className="kpi-top"><span>Total booking</span><span className="kpi-icon blue"><CalendarDays size={18} /></span></div><div className="kpi-number">{base.length}<span>booking</span></div><div className="kpi-bottom">Seluruh status pada cabang pilihan</div></article>
      <article className="kpi-card"><div className="kpi-top"><span>Rental berjalan</span><span className="kpi-icon orange"><CarFront size={18} /></span></div><div className="kpi-number">{base.filter(b => b.status === 'running').length}<span>rental</span></div><div className="kpi-bottom">Kendaraan sedang bersama pelanggan</div></article>
      <article className="kpi-card"><div className="kpi-top"><span>Akan datang</span><span className="kpi-icon green"><CalendarDays size={18} /></span></div><div className="kpi-number">{base.filter(b => b.status === 'confirmed').length}<span>booking</span></div><div className="kpi-bottom">Booking dikonfirmasi, belum diserahkan</div></article>
      <article className="kpi-card attention"><div className="kpi-top"><span>Sisa pembayaran</span><span className="kpi-icon yellow"><Wallet size={18} /></span></div><div className="kpi-number money-number">{money(base.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + b.total - b.paid, 0), true)}</div><div className="kpi-bottom">Total booking aktif dan selesai, di luar deposit</div></article>
    </div>
    <section className="panel bookings-list" aria-label="Daftar booking">
      <div className="bookings-tabs" role="tablist" aria-label="Status booking">{tabs.map(([key, label]) => <button role="tab" aria-selected={tab === key} className={tab === key ? 'selected' : ''} key={key} onClick={() => setTab(key)}>{label}<span className="count">{key === 'all' ? base.length : base.filter(b => b.status === key).length}</span></button>)}</div>
      <div className="bookings-actions"><label className="search-input module-search"><Search size={16} /><input aria-label="Cari daftar booking" value={query} onChange={e => setQuery(e.target.value)} placeholder="Cari booking, pelanggan, kendaraan atau plat…" />{query && <button aria-label="Hapus pencarian booking" onClick={() => setQuery('')}><X size={15} /></button>}</label><div className="bookings-action-buttons"><label className="filter-control sort-filter"><ArrowDownUp size={15} /><select aria-label="Urutkan booking" value={sort} onChange={e => setSort(e.target.value)}><option value="created">Terbaru dibuat</option><option value="start">Jadwal terdekat</option><option value="total">Nilai tertinggi</option></select></label><button className="button" onClick={exportCSV} disabled={!filtered.length}><Download size={15} />Ekspor CSV</button></div></div>
      <div className="module-filterbar"><span className="filter-label"><Filter size={14} />Filter {activeFilters > 0 && <span className="count">{activeFilters}</span>}</span>
        <label><span className="sr-only">Cabang booking</span><select aria-label="Cabang booking" value={branch} onChange={e => onBranch(e.target.value)}>{['Semua cabang', ...branchNames(data)].map(b => <option key={b}>{b}</option>)}</select></label>
        <label><span className="sr-only">Kategori kendaraan booking</span><select aria-label="Kategori kendaraan booking" value={category} onChange={e => setCategory(e.target.value)}><option value="all">Semua kendaraan</option><option>Mobil</option><option>Minibus</option></select></label>
        <label><span className="sr-only">Pembayaran booking</span><select aria-label="Pembayaran booking" value={payment} onChange={e => setPayment(e.target.value)}><option value="all">Semua pembayaran</option><option value="full">Lunas</option><option value="partial">DP / sebagian</option><option value="unpaid">Belum bayar</option></select></label>
        <div className="date-range-filter"><label><span>Dari</span><DateField aria-label="Periode booking dari" type="date" min="2020-01-01" max="2100-12-31" value={from} onChange={e => setFrom(e.target.value)} /></label><span>–</span><label><span>Sampai</span><DateField aria-label="Periode booking sampai" type="date" min="2020-01-01" max="2100-12-31" value={to} onChange={e => setTo(e.target.value)} /></label></div>
        {(activeFilters > 0 || query || tab !== 'all') && <button className="text-button reset-filters" onClick={reset}>Reset filter <X size={13} /></button>}
      </div>
      {dateError && <p className="filter-error" role="alert">Tanggal akhir filter harus sama atau setelah tanggal awal.</p>}
      <div className="bookings-desktop-table table-scroll"><table className="bookings-table"><thead><tr><th>Booking</th><th>Pelanggan</th><th>Kendaraan</th><th>Periode rental <span>WITA</span></th><th>Status</th><th>Total & pembayaran</th><th><span className="sr-only">Tindakan</span></th></tr></thead><tbody>{visible.map(b => {
        const unit = data.units.find(u => u.id === b.unitId)!, customer = data.customers.find(c => c.id === b.customerId)!;
        return <tr key={b.id}><td><button className="booking-link" onClick={() => onOpen(b)}>{b.id}</button><span className="cell-sub">{dateLabel(b.createdAt, { year: 'numeric' })}</span></td><td><div className="person"><Avatar name={customer.name} index={data.customers.indexOf(customer)} /><span><strong>{customer.name}</strong><span className="cell-sub">{customer.type === 'Business' ? 'Perusahaan' : 'Individual'}</span></span></div></td><td><strong>{unit.name}</strong><span className="cell-sub">{unit.plate} · {unit.branch}</span></td><td><strong>{period(b.start, b.end)}</strong><span className="cell-sub">PIC {b.pic}</span></td><td><Badge tone={statusTone[b.status]}>{statusText[b.status]}</Badge></td><td><strong>{money(b.total)}</strong><span className="cell-sub"><Badge tone={b.paid >= b.total ? 'green' : b.paid > 0 ? 'yellow' : 'red'}>{b.paid===0&&b.paymentSetup?.mode==='after_return'?'Bayar setelah selesai':paymentStatus(b.total, b.paid)}</Badge></span>{invoiceLink(b)}</td><td><button className="icon-button" aria-label={`Lihat booking ${b.id}`} onClick={() => onOpen(b)}><ArrowRight size={15} /></button></td></tr>;
      })}</tbody></table></div>
      <div className="booking-mobile-list">{visible.map(b => {
        const unit = data.units.find(u => u.id === b.unitId)!, customer = data.customers.find(c => c.id === b.customerId)!;
        return <article className="booking-mobile-card" key={b.id}><header><button className="booking-link" onClick={() => onOpen(b)}>{b.id}</button><Badge tone={statusTone[b.status]}>{statusText[b.status]}</Badge></header><div className="mobile-booking-customer"><Avatar name={customer.name} index={data.customers.indexOf(customer)} /><span><strong>{customer.name}</strong><small>{unit.name} · {unit.plate}</small></span></div><dl><div><dt>Periode</dt><dd>{period(b.start, b.end)}</dd></div><div><dt>Cabang</dt><dd>{unit.branch}</dd></div><div><dt>Total</dt><dd>{money(b.total)}</dd></div><div><dt>Pembayaran</dt><dd><Badge tone={b.paid >= b.total ? 'green' : b.paid > 0 ? 'yellow' : 'red'}>{b.paid===0&&b.paymentSetup?.mode==='after_return'?'Bayar setelah selesai':paymentStatus(b.total, b.paid)}</Badge></dd></div><div><dt>Invoice</dt><dd>{invoiceLink(b)}</dd></div></dl><footer>{b.status === 'confirmed' && !data.invoices?.some(i=>i.bookingId===b.id&&i.status==='issued') && <button className="text-button" onClick={() => onEdit(b)}>Ubah jadwal</button>}<button className="button" onClick={() => onOpen(b)}>Lihat detail <ArrowRight size={14} /></button></footer></article>;
      })}</div>
      {!visible.length && <div className="module-empty"><Search size={28} /><h3>Booking tidak ditemukan</h3><p>{dateError ? 'Periksa kembali rentang tanggal yang dipilih.' : 'Coba kata pencarian atau filter lain.'}</p><button className="button" onClick={reset}>Reset filter</button></div>}
      <footer className="pagination-footer"><span>{filtered.length ? `${(currentPage - 1) * 8 + 1}–${Math.min(currentPage * 8, filtered.length)}` : '0'} dari {filtered.length} booking</span><div className="pagination"><button className="icon-button" aria-label="Halaman booking sebelumnya" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}><ChevronLeft size={16} /></button><span>Halaman {currentPage} dari {totalPages}</span><button className="icon-button" aria-label="Halaman booking berikutnya" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}><ChevronRight size={16} /></button></div></footer>
    </section>
    <p className="module-footnote">Rentang tanggal menampilkan booking yang beririsan dengan periode pilihan. Semua waktu menggunakan WITA.</p>
    {exportStatus && <p className="export-status" role="status">{exportStatus}</p>}
  </div>;
}
