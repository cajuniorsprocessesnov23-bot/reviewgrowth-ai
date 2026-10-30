'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { ArrowLeft, Download, ExternalLink, LoaderCircle, MapPin, QrCode, RefreshCw, ShieldCheck } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

type Location = { id: string; name: string; address: string | null; city: string | null; public_slug: string; is_active: boolean };

export default function QRManagementPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [origin, setOrigin] = useState('');
  const [png, setPng] = useState('');
  const [svg, setSvg] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    let cancelled = false;
    async function loadLocations() {
      setLoading(true);
      setError('');
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error: queryError } = await supabase
          .from('locations')
          .select('id,name,address,city,public_slug,is_active')
          .eq('is_active', true)
          .order('name');
        if (queryError) throw queryError;
        if (!cancelled) {
          const rows = (data || []) as Location[];
          setLocations(rows);
          setSelectedId((current) => current || rows[0]?.id || '');
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load locations. Check your Supabase setup and sign-in status.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void loadLocations();
    return () => { cancelled = true; };
  }, []);

  const selected = useMemo(() => locations.find((location) => location.id === selectedId) || null, [locations, selectedId]);
  const feedbackUrl = selected && origin ? `${origin}/feedback/${encodeURIComponent(selected.public_slug)}` : '';

  const generate = useCallback(async () => {
    if (!feedbackUrl) return;
    setGenerating(true);
    setError('');
    setNotice('');
    try {
      const [pngData, svgMarkup] = await Promise.all([
        QRCode.toDataURL(feedbackUrl, { errorCorrectionLevel: 'H', margin: 3, width: 640, color: { dark: '#171923', light: '#FFFFFF' } }),
        QRCode.toString(feedbackUrl, { type: 'svg', errorCorrectionLevel: 'H', margin: 3, width: 640, color: { dark: '#171923', light: '#FFFFFF' } }),
      ]);
      setPng(pngData);
      setSvg(svgMarkup);
      setNotice('QR code generated for this location.');
    } catch {
      setError('QR generation failed. Please try again.');
    } finally {
      setGenerating(false);
    }
  }, [feedbackUrl]);

  useEffect(() => {
    setPng('');
    setSvg('');
    setNotice('');
    if (feedbackUrl) void generate();
  }, [feedbackUrl, generate]);

  function downloadFile(contents: string, type: string, extension: string) {
    if (!contents || !selected) return;
    const blob = new Blob([contents], { type });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = `reviewgrowth-${selected.public_slug}-qr.${extension}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <main className="qr-page">
      <header className="qr-topbar">
        <Link href="/" className="qr-back"><ArrowLeft size={16}/> Back to dashboard</Link>
        <div className="qr-brand"><span><QrCode size={16}/></span> REVIEWGROWTH AI</div>
      </header>

      <div className="qr-content">
        <div className="qr-heading">
          <div className="qr-heading-icon"><QrCode size={22}/></div>
          <div><div className="qr-eyebrow">SELF-SERVICE LOCATION TOOLS</div><h1>QR Code Management</h1><p>Create and download feedback QR codes for each of your business locations.</p></div>
        </div>

        <div className="qr-workspace">
          <section className="qr-controls">
            <div className="qr-section-title"><MapPin size={17}/><div><h2>Select a location</h2><p>Each location has its own permanent feedback link and QR code.</p></div></div>
            {loading ? <div className="qr-loading"><LoaderCircle className="qr-spin"/> Loading your locations...</div> : locations.length ? <>
              <label className="qr-label" htmlFor="qr-location">Business location</label>
              <select id="qr-location" className="qr-select" value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>
                {locations.map((location) => <option value={location.id} key={location.id}>{location.name}{location.city ? ` · ${location.city}` : ''}</option>)}
              </select>
              {selected && <div className="qr-location-card"><strong>{selected.name}</strong><span>{[selected.address, selected.city].filter(Boolean).join(', ') || 'Address not added'}</span><small><i/> Active location</small></div>}
              <div className="qr-link-label">LOCATION FEEDBACK LINK</div>
              <div className="qr-url-box"><span>{feedbackUrl}</span><button type="button" onClick={() => { void navigator.clipboard.writeText(feedbackUrl); setNotice('Feedback link copied.'); }} title="Copy feedback link">Copy link</button></div>
              <div className="qr-hint"><ShieldCheck size={15}/> This QR always opens this location's feedback page. The link remains the same when you regenerate the artwork.</div>
            </> : <div className="qr-empty"><MapPin size={24}/><strong>No active locations found</strong><p>Add a location to your business first. Each location needs a unique public feedback slug.</p></div>}
            {error && <div className="qr-error">{error}</div>}
          </section>

          <section className="qr-preview-panel">
            <div className="qr-preview-head"><div><div className="qr-eyebrow">PRINT-READY PREVIEW</div><h2>Your feedback QR code</h2></div><button className="qr-refresh" onClick={() => void generate()} disabled={!feedbackUrl || generating} title="Regenerate QR"><RefreshCw size={15}/></button></div>
            <div className="qr-artboard">
              {generating ? <div className="qr-placeholder"><LoaderCircle className="qr-spin" size={28}/><span>Generating QR code...</span></div> : png ? <div className="qr-image-wrap"><img src={png} alt={selected ? `Feedback QR code for ${selected.name}` : 'Feedback QR code'}/><strong>{selected?.name}</strong><span>SCAN TO SHARE YOUR EXPERIENCE</span></div> : <div className="qr-placeholder"><QrCode size={36}/><span>Select a location to preview its QR code.</span></div>}
            </div>
            <div className="qr-downloads">
              <button type="button" onClick={() => downloadFile(png, 'image/png', 'png')} disabled={!png || generating}><Download size={16}/> Download PNG</button>
              <button type="button" className="qr-secondary" onClick={() => downloadFile(svg, 'image/svg+xml;charset=utf-8', 'svg')} disabled={!svg || generating}><Download size={16}/> Download SVG</button>
            </div>
            {feedbackUrl && <a className="qr-open-link" href={feedbackUrl} target="_blank" rel="noreferrer">Open customer feedback page <ExternalLink size={14}/></a>}
          </section>
        </div>
        <div className="qr-print-note"><strong>Printing tip</strong><span>Use SVG for sharp, scalable printing on table tents, counter displays, stickers and receipts. Use PNG for quick digital sharing.</span></div>
      </div>
      {notice && <div className="qr-toast" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
    </main>
  );
}
