-- Ensure admin inserts are allowed explicitly (WITH CHECK mirrors USING).
drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all
  using (is_admin())
  with check (is_admin());
