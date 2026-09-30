<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'value',
        'group',
        'type',
        'description',
    ];

    /**
     * Get a setting value by key, with type casting and optional fallback.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        if (!$setting) {
            return $default;
        }

        return static::castValue($setting->value, $setting->type);
    }

    /**
     * Set / update a setting value.
     */
    public static function set(string $key, mixed $value, ?string $group = null, ?string $type = null, ?string $description = null): static
    {
        if ($type === null) {
            $type = static::detectType($value);
        }

        $serializedValue = static::serializeValue($value, $type);

        $payload = [
            'value' => $serializedValue,
            'type' => $type,
        ];

        if ($group !== null) {
            $payload['group'] = $group;
        }

        if ($description !== null) {
            $payload['description'] = $description;
        }

        return static::updateOrCreate(
            ['key' => $key],
            $payload
        );
    }

    /**
     * Get all settings grouped by group name as key-value pairs.
     */
    public static function getAllGrouped(): array
    {
        $settings = static::all();
        $grouped = [];

        foreach ($settings as $setting) {
            $group = $setting->group ?? 'general';
            if (!isset($grouped[$group])) {
                $grouped[$group] = [];
            }
            $grouped[$group][$setting->key] = static::castValue($setting->value, $setting->type);
        }

        return $grouped;
    }

    /**
     * Get settings for a specific group.
     */
    public static function getGroup(string $group): array
    {
        $settings = static::where('group', $group)->get();
        $result = [];

        foreach ($settings as $setting) {
            $result[$setting->key] = static::castValue($setting->value, $setting->type);
        }

        return $result;
    }

    /**
     * Cast raw database string to target type.
     */
    protected static function castValue(?string $value, string $type): mixed
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => filter_var($value, FILTER_VALIDATE_BOOLEAN),
            'integer', 'int' => (int) $value,
            'float', 'double' => (float) $value,
            'array', 'json' => json_decode($value, true),
            default => $value,
        };
    }

    /**
     * Serialize PHP value into string for storage.
     */
    protected static function serializeValue(mixed $value, string $type): ?string
    {
        if ($value === null) {
            return null;
        }

        return match ($type) {
            'boolean' => $value ? '1' : '0',
            'array', 'json' => is_string($value) ? $value : json_encode($value),
            default => (string) $value,
        };
    }

    /**
     * Auto detect type from value.
     */
    protected static function detectType(mixed $value): string
    {
        if (is_bool($value)) return 'boolean';
        if (is_int($value)) return 'integer';
        if (is_float($value)) return 'float';
        if (is_array($value)) return 'json';
        return 'string';
    }
}
