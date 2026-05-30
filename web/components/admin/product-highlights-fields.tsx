"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AdminFormSection } from "@/components/admin/admin-ui";

export type ProductHighlightFormState = {
  is_trending: boolean;
  is_premium: boolean;
  on_sale: boolean;
  sale_price: string;
  discount_percent: string;
  sale_start_at: string;
  sale_end_at: string;
};

export const defaultHighlightFormState: ProductHighlightFormState = {
  is_trending: false,
  is_premium: false,
  on_sale: false,
  sale_price: "",
  discount_percent: "",
  sale_start_at: "",
  sale_end_at: "",
};

export function highlightStateFromProduct(product: {
  is_trending?: boolean;
  is_premium?: boolean;
  on_sale?: boolean;
  sale_price?: number | null;
  discount_percent?: number | null;
  sale_start_at?: string | null;
  sale_end_at?: string | null;
}): ProductHighlightFormState {
  return {
    is_trending: product.is_trending ?? false,
    is_premium: product.is_premium ?? false,
    on_sale: product.on_sale ?? false,
    sale_price: product.sale_price != null ? String(product.sale_price) : "",
    discount_percent:
      product.discount_percent != null ? String(product.discount_percent) : "",
    sale_start_at: product.sale_start_at
      ? product.sale_start_at.slice(0, 16)
      : "",
    sale_end_at: product.sale_end_at ? product.sale_end_at.slice(0, 16) : "",
  };
}

export function highlightPayloadFromForm(state: ProductHighlightFormState) {
  const salePrice = state.sale_price.trim();
  const discount = state.discount_percent.trim();

  return {
    is_trending: state.is_trending,
    is_premium: state.is_premium,
    on_sale: state.on_sale,
    sale_price: salePrice ? parseFloat(salePrice) : null,
    discount_percent: discount ? parseInt(discount, 10) : null,
    sale_start_at: state.sale_start_at ? new Date(state.sale_start_at).toISOString() : null,
    sale_end_at: state.sale_end_at ? new Date(state.sale_end_at).toISOString() : null,
  };
}

function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border-subtle/60 bg-ocean-deep/30 p-4 transition-colors hover:border-ocean-mid/30">
      <div>
        <Label htmlFor={id} className="font-body font-semibold text-foreground">
          {label}
        </Label>
        <p className="mt-1 font-body text-sm text-muted-foreground">{description}</p>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-5 w-5 accent-gold-light"
      />
    </div>
  );
}

export function ProductHighlightsFields({
  value,
  onChange,
  disabled,
}: {
  value: ProductHighlightFormState;
  onChange: (next: ProductHighlightFormState) => void;
  disabled?: boolean;
}) {
  return (
    <AdminFormSection
      title="Highlights & Sale"
      description="Control badges on the storefront and /highlights page. On Sale takes priority over other badges."
    >
      <div className="space-y-3">
      <ToggleRow
        id="is_trending"
        label="Most Selling / Trending"
        description='Shows "Most Selling" badge and appears in Trending section.'
        checked={value.is_trending}
        onChange={(checked) => onChange({ ...value, is_trending: checked })}
        disabled={disabled}
      />

      <ToggleRow
        id="is_premium"
        label="Premium"
        description='Shows "Premium Products" badge and appears in Premium section.'
        checked={value.is_premium}
        onChange={(checked) => onChange({ ...value, is_premium: checked })}
        disabled={disabled}
      />

      <ToggleRow
        id="on_sale"
        label="On Sale"
        description='Shows "On Sale" badge and sale pricing on product cards.'
        checked={value.on_sale}
        onChange={(checked) => onChange({ ...value, on_sale: checked })}
        disabled={disabled}
      />

      {value.on_sale && (
        <div className="grid gap-4 border-t border-border-subtle/50 pt-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sale_price" className="font-body">Sale price (PKR)</Label>
            <Input
              id="sale_price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Fixed sale price"
              value={value.sale_price}
              onChange={(e) => onChange({ ...value, sale_price: e.target.value })}
              disabled={disabled}
              className="admin-input rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="discount_percent" className="font-body">Or discount %</Label>
            <Input
              id="discount_percent"
              type="number"
              min="0"
              max="100"
              placeholder="e.g. 20"
              value={value.discount_percent}
              onChange={(e) => onChange({ ...value, discount_percent: e.target.value })}
              disabled={disabled}
              className="admin-input rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale_start_at" className="font-body">Sale start (optional)</Label>
            <Input
              id="sale_start_at"
              type="datetime-local"
              value={value.sale_start_at}
              onChange={(e) => onChange({ ...value, sale_start_at: e.target.value })}
              disabled={disabled}
              className="admin-input rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sale_end_at" className="font-body">Sale end (optional)</Label>
            <Input
              id="sale_end_at"
              type="datetime-local"
              value={value.sale_end_at}
              onChange={(e) => onChange({ ...value, sale_end_at: e.target.value })}
              disabled={disabled}
              className="admin-input rounded-full"
            />
          </div>
        </div>
      )}
      </div>
    </AdminFormSection>
  );
}
