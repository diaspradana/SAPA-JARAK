<?php

namespace App\Services;

use App\Models\Hamlet;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class HamletLocationService
{
    public function options(bool $activeOnly = true): Collection
    {
        $valuesByHamlet = [];

        foreach (['beneficiaries', 'users'] as $table) {
            if (!Schema::hasTable($table) || !Schema::hasColumns($table, ['hamlet_id', 'rt', 'rw'])) {
                continue;
            }

            foreach (DB::table($table)
                ->whereNotNull('hamlet_id')
                ->get(['hamlet_id', 'rt', 'rw']) as $row) {
                $hamletId = (int) $row->hamlet_id;
                $valuesByHamlet[$hamletId]['rt'][] = $row->rt;
                $valuesByHamlet[$hamletId]['rw'][] = $row->rw;
            }
        }

        $hamlets = Hamlet::query()->orderBy('name');
        if ($activeOnly) {
            $hamlets->where('status', 'active');
        }

        return $hamlets->get()->map(function (Hamlet $hamlet) use ($valuesByHamlet): array {
            $values = $valuesByHamlet[$hamlet->id] ?? [];

            return array_merge($hamlet->toArray(), [
                'rt_values' => $this->sortValues($values['rt'] ?? []),
                'rw_values' => $this->sortValues($values['rw'] ?? []),
            ]);
        });
    }

    private function sortValues(array $values): array
    {
        $values = array_values(array_unique(array_filter(
            array_map(fn ($value) => trim((string) $value), $values),
            fn (string $value) => $value !== ''
        )));
        usort($values, 'strnatcasecmp');

        return $values;
    }
}
