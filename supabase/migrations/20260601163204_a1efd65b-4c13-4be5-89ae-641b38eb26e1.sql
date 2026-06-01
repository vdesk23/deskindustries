GRANT SELECT, UPDATE ON public.follia_sites TO authenticated;
GRANT ALL ON public.follia_sites TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_menu_items TO authenticated;
GRANT ALL ON public.follia_menu_items TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_products TO authenticated;
GRANT ALL ON public.follia_products TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.follia_services TO authenticated;
GRANT ALL ON public.follia_services TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.follia_appointments TO authenticated;
GRANT ALL ON public.follia_appointments TO service_role;

GRANT SELECT, INSERT, UPDATE ON public.follia_table_bookings TO authenticated;
GRANT ALL ON public.follia_table_bookings TO service_role;

GRANT SELECT, INSERT ON public.follia_tickets TO authenticated;
GRANT ALL ON public.follia_tickets TO service_role;

GRANT SELECT, INSERT ON public.follia_ticket_messages TO authenticated;
GRANT ALL ON public.follia_ticket_messages TO service_role;

GRANT SELECT, INSERT ON public.follia_custom_domain_requests TO authenticated;
GRANT ALL ON public.follia_custom_domain_requests TO service_role;