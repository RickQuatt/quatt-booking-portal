import React from 'react'
import { debounce, omit } from 'lodash-es'

import classes from './Filters.module.css'
import { AdminCic } from '../api-client/models';
import { Input } from '../ui-components/input/Input';
import { Select } from '../ui-components/select/Select';

export type CICFilters = 
  Partial<Omit<AdminCic, 'created_at'>>
  & {
    minCreatedAt?: AdminCic['createdAt']
    maxCreatedAt?: AdminCic['createdAt']
    minLastConnectionStatusUpdatedAt?: AdminCic['lastConnectionStatusUpdatedAt']
    maxLastConnectionStatusUpdatedAt?: AdminCic['lastConnectionStatusUpdatedAt']
  }

export function filterCICList(
  list: AdminCic[],
  filters: CICFilters
) {
  return list.filter(cicEntry => {
    return Object.entries(filters).every(([filterKey, filterValue]) => {
      if (filters.minCreatedAt && filterKey === 'minCreatedAt') {
        const createdDate = cicEntry.createdAt
        return filters.minCreatedAt < createdDate
      }
      if (filters.maxCreatedAt && filterKey === 'maxCreatedAt') {
        const createdDate = new Date(cicEntry.createdAt)
        return filters.maxCreatedAt > createdDate
      }
      if (filters.minLastConnectionStatusUpdatedAt && filterKey === 'minLastConnectionStatusUpdatedAt') {
        if (!cicEntry.lastConnectionStatusUpdatedAt) return false
        return filters.minLastConnectionStatusUpdatedAt < cicEntry.lastConnectionStatusUpdatedAt
      }
      if (filters.maxLastConnectionStatusUpdatedAt && filterKey === 'maxLastConnectionStatusUpdatedAt') {
        if (!cicEntry.lastConnectionStatusUpdatedAt) return false
        return filters.maxLastConnectionStatusUpdatedAt > cicEntry.lastConnectionStatusUpdatedAt
      }

      return filterValue === cicEntry[filterKey as keyof AdminCic]
    })
  })
}

export function TextFilter({
  setFilters,
  filterKey,
  inputType = 'text'
}: {
  setFilters: SetFiltersFunc
  filterKey: keyof AdminCic
  inputType?: React.HTMLInputTypeAttribute
}) {
  const doSetFilters = React.useCallback((value: string) => {
    setFilters((filters: CICFilters) => {
      console.log(value)
      if (!value) {
        return omit(filters, filterKey)
      }
      const parsedValue = inputType === 'number' ? Number(value) : value
      return { ...filters, [filterKey]: parsedValue }
    })
  }, [setFilters, filterKey, inputType])

  const debouncedSetFilters = React.useMemo(
    () => debounce(doSetFilters, 100),
    [doSetFilters]
  )

  const onChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    debouncedSetFilters(value)
  }, [debouncedSetFilters])

  return (
    <Input
      type={inputType}
      onChange={onChange}
    />
  )
}

type SetFiltersFunc = (setFiltersFunc: (oldFilters: CICFilters) => CICFilters) => void
type FilterProps = { setFilters: SetFiltersFunc }

export function IDFilter({ setFilters }: FilterProps) {
  return (
    <TextFilter setFilters={setFilters} filterKey={"id"} />
  )
}

export function CableConnectionStatusFilter({
  setFilters
}: {
  setFilters: SetFiltersFunc
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AdminCic['cableConnectionStatus']
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'cableConnectionStatus')
      }
      return { ...filters, cableConnectionStatus: value }
    })
  }, [setFilters])

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  )
}

export function WifiConnectionStatusFilter({
  setFilters
}: {
  setFilters: SetFiltersFunc
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AdminCic['wifiConnectionStatus']
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'wifiConnectionStatus')
      }
      return { ...filters, wifiConnectionStatus: value }
    })
  }, [setFilters])

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  )
}


export function LTEConnectionStatusFilter({
  setFilters
}: {
  setFilters: SetFiltersFunc
}) {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as AdminCic['lteConnectionStatus']
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'lteConnectionStatus')
      }
      return { ...filters, lteConnectionStatus: value }
    })
  }, [setFilters])

  return (
    <Select onChange={onChange}>
      <option value="">Any</option>
      <option value="connected">Connected</option>
      <option value="disconnected">Disconnected</option>
      <option value="not_reachable">Not reachable</option>
    </Select>
  )
}

export function SupervisoryControlModeFilter({ setFilters }: FilterProps) {
  return (
    <TextFilter
      setFilters={setFilters}
      filterKey={"supervisoryControlMode"}
      inputType='number'
    />
  )
}

export function OrderNumberFilter({ setFilters }: FilterProps) {
  return (
    <TextFilter
      setFilters={setFilters}
      filterKey={"orderNumber"}
    />
  )
}

const maxDate = new Date().toISOString().slice(0,-8)

export function CreatedDateFilter({ setFilters }: FilterProps) {
  const onChangeMinDate = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'minCreatedAt')
      }
      return { ...filters, minCreatedAt: new Date(value) }
    })
  }, [setFilters])

  const onChangeMaxDate = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'maxCreatedAt')
      }
      return { ...filters, maxCreatedAt: new Date(value) }
    })
  }, [setFilters])

  return (
    <div className={classes['created-date-filter-container']}>
      <input
        type="datetime-local"
        max={maxDate}
        onChange={onChangeMinDate}
      />
      <input
        type="datetime-local"
        max={maxDate}
        onChange={onChangeMaxDate}
      />
    </div>
  )
}

export function LastConnectionStatusFilter({ setFilters }: FilterProps) {
  const onChangeMinDate = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'minLastConnectionStatusUpdatedAt')
      }
      return { ...filters, minLastConnectionStatusUpdatedAt: new Date(value) }
    })
  }, [setFilters])

  const onChangeMaxDate = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((filters: CICFilters) => {
      if (!value) {
        return omit(filters, 'maxLastConnectionStatusUpdatedAt')
      }
      return { ...filters, maxLastConnectionStatusUpdatedAt: new Date(value) }
    })
  }, [setFilters])

  return (
    <div className={classes['created-date-filter-container']}>
      <input
        type="datetime-local"
        max={maxDate}
        onChange={onChangeMinDate}
      />
      <input
        type="datetime-local"
        max={maxDate}
        onChange={onChangeMaxDate}
      />
    </div>
  )
}