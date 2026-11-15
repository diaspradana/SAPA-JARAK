import React from 'react';

const controlClassName = 'mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-60';

export default function HamletAddressFields({
  hamlets = [],
  hamletId = '',
  rt = '',
  rw = '',
  address = '',
  onHamletChange,
  onRtChange,
  onRwChange,
  onAddressChange,
  loading = false,
  error = '',
  fieldErrors = {},
  idPrefix = 'resident-address',
  showAddress = true,
  addressRequired = true,
  addressLabel = 'Alamat lengkap',
  addressPlaceholder = '',
}) {
  const selectedHamlet = hamlets.find((hamlet) => String(hamlet.id) === String(hamletId));

  const emptyOptionLabel = loading
    ? 'Memuat data wilayah...'
    : selectedHamlet
      ? 'Belum ada data RT/RW di database'
      : 'Pilih dusun terlebih dahulu';

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="space-y-1.5 text-sm font-semibold">
        Dusun *
        <select
          id={`${idPrefix}-hamlet`}
          required
          value={hamletId}
          onChange={(event) => onHamletChange(event.target.value)}
          className={controlClassName}
          disabled={loading || hamlets.length === 0}
        >
          <option value="">{loading ? 'Memuat daftar dusun...' : 'Pilih dusun'}</option>
          {hamlets.map((hamlet) => (
            <option
              key={hamlet.id}
              value={hamlet.id}
              disabled={!hamlet.rt_values?.length || !hamlet.rw_values?.length}
            >
              {hamlet.name}
              {(!hamlet.rt_values?.length || !hamlet.rw_values?.length) ? ' (belum ada data RT/RW)' : ''}
            </option>
          ))}
        </select>
        {fieldErrors.hamletId && <span className="block text-xs font-medium text-rose-600">{fieldErrors.hamletId}</span>}
      </label>

      <label className="space-y-1.5 text-sm font-semibold">
        RT *
        <select
          id={`${idPrefix}-rt`}
          required
          value={rt}
          onChange={(event) => onRtChange(event.target.value)}
          className={controlClassName}
          disabled={!selectedHamlet || loading || selectedHamlet.rt_values?.length === 0}
        >
          <option value="">{selectedHamlet?.rt_values?.length ? 'Pilih RT' : emptyOptionLabel}</option>
          {(selectedHamlet?.rt_values || []).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        {fieldErrors.rt && <span className="block text-xs font-medium text-rose-600">{fieldErrors.rt}</span>}
      </label>

      <label className="space-y-1.5 text-sm font-semibold">
        RW *
        <select
          id={`${idPrefix}-rw`}
          required
          value={rw}
          onChange={(event) => onRwChange(event.target.value)}
          className={controlClassName}
          disabled={!selectedHamlet || loading || selectedHamlet.rw_values?.length === 0}
        >
          <option value="">{selectedHamlet?.rw_values?.length ? 'Pilih RW' : emptyOptionLabel}</option>
          {(selectedHamlet?.rw_values || []).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        {fieldErrors.rw && <span className="block text-xs font-medium text-rose-600">{fieldErrors.rw}</span>}
      </label>

      {showAddress && (
        <label className="space-y-1.5 text-sm font-semibold sm:col-span-2">
          {addressLabel} {addressRequired ? '*' : ''}
          <input
            id={`${idPrefix}-address`}
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            maxLength={255}
            required={addressRequired}
            placeholder={addressPlaceholder}
            className={controlClassName}
          />
          {fieldErrors.address && <span className="block text-xs font-medium text-rose-600">{fieldErrors.address}</span>}
        </label>
      )}

      {error && <p role="alert" className="text-xs font-medium text-rose-600 sm:col-span-2">{error}</p>}
    </div>
  );
}
