create or replace function delete_all_queries()
returns void
language sql
security definer
as $$
  delete from queries;
$$;

