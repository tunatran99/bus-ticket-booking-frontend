import type { LucideIcon } from 'lucide-react';
import { MapPin, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useLanguage } from '../contexts/LanguageContext';
import { hubProvinces, provinceGroups } from '../lib/provinces';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ProvinceSelectProps {
  label: string;
  value: string;
  onChange: (province: string) => void;
  placeholder?: string;
  icon?: LucideIcon;
  popular?: string[];
}

export function ProvinceSelect({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon = MapPin,
  popular,
}: ProvinceSelectProps) {
  const { t } = useLanguage();
  const displayPlaceholder = placeholder ?? t('provincePicker.searchPlaceholder');
  const resolvedPopular = popular ?? hubProvinces;
  const regionLabels: Record<string, string> = {
    north: t('provincePicker.north'),
    central: t('provincePicker.central'),
    south: t('provincePicker.south'),
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4" />
        {label}
      </Label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
        {resolvedPopular.map((province) => (
          <Button
            key={province}
            type="button"
            variant={value === province ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onChange(province)}
          >
            <Sparkles className="size-3 mr-1" />
            {province}
          </Button>
        ))}
      </div>

      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full mt-1">
          <SelectValue placeholder={displayPlaceholder} />
        </SelectTrigger>
        <SelectContent
          className="max-h-64 w-[320px] overflow-y-auto"
          position="popper"
          sideOffset={6}
        >
          {provinceGroups.map((group) => (
            <SelectGroup key={group.id}>
              <SelectLabel>{regionLabels[group.id] ?? group.id}</SelectLabel>
              {group.provinces.map((province) => (
                <SelectItem key={province} value={province}>
                  <MapPin className="size-3 text-muted-foreground mr-2" />
                  {province}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => onChange('')}
        disabled={!value}
      >
        {t('provincePicker.clear')}
      </Button>
    </div>
  );
}
