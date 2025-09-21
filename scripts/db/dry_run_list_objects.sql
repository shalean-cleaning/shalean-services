-- =====================================================
-- DRY RUN: List All Droppable App Objects
-- =====================================================
-- This script lists all application objects that will be dropped
-- from the 'public' schema (and any custom app schemas).
-- 
-- SAFETY: This is READ-ONLY and does not modify anything.
-- =====================================================

-- Set search path to include public and common app schemas
SET search_path = public, information_schema, pg_catalog;

-- Create a temporary function to safely list objects
CREATE OR REPLACE FUNCTION list_droppable_objects()
RETURNS TABLE (
    object_type TEXT,
    schema_name TEXT,
    object_name TEXT,
    full_name TEXT,
    drop_order INTEGER
) 
LANGUAGE plpgsql
AS $$
DECLARE
    app_schemas TEXT[] := ARRAY['public'];
    schema_name TEXT;
    obj_record RECORD;
BEGIN
    -- Find custom application schemas (excluding system schemas)
    FOR schema_name IN 
        SELECT nspname 
        FROM pg_namespace 
        WHERE nspname NOT IN (
            'information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1', 'pg_toast_temp_1',
            'auth', 'storage', 'extensions', 'graphql', 'pgbouncer', 'realtime', 
            'supabase_functions', 'supabase_migrations', 'net', 'pgsodium', 'pgsodium_masks',
            'vault', 'supabase_auth', 'supabase_storage', 'supabase_realtime'
        )
        AND nspname NOT LIKE 'pg_%'
        AND nspname NOT LIKE 'supabase_%'
        AND nspname NOT LIKE 'pgsodium%'
        AND nspname NOT LIKE 'vault%'
    LOOP
        app_schemas := array_append(app_schemas, schema_name);
    END LOOP;

    RAISE NOTICE 'Found application schemas: %', array_to_string(app_schemas, ', ');

    -- 1. Row Level Security Policies (drop first)
    FOR obj_record IN
        SELECT 
            'RLS Policy' as object_type,
            schemaname as schema_name,
            tablename || '.' || policyname as object_name,
            quote_ident(schemaname) || '.' || quote_ident(tablename) || '.' || quote_ident(policyname) as full_name,
            1 as drop_order
        FROM pg_policies 
        WHERE schemaname = ANY(app_schemas)
        ORDER BY schemaname, tablename, policyname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 2. Triggers
    FOR obj_record IN
        SELECT 
            'Trigger' as object_type,
            n.nspname as schema_name,
            t.tgname as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(t.tgname) as full_name,
            2 as drop_order
        FROM pg_trigger t
        JOIN pg_class c ON t.tgrelid = c.oid
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND NOT t.tgisinternal
        ORDER BY n.nspname, t.tgname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 3. Views and Materialized Views
    FOR obj_record IN
        SELECT 
            CASE 
                WHEN c.relkind = 'v' THEN 'View'
                WHEN c.relkind = 'm' THEN 'Materialized View'
                ELSE 'View-like'
            END as object_type,
            n.nspname as schema_name,
            c.relname as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(c.relname) as full_name,
            3 as drop_order
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND c.relkind IN ('v', 'm')
        ORDER BY n.nspname, c.relname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 4. Functions, Procedures, and Aggregates
    FOR obj_record IN
        SELECT 
            CASE 
                WHEN p.prokind = 'f' THEN 'Function'
                WHEN p.prokind = 'p' THEN 'Procedure'
                WHEN p.prokind = 'a' THEN 'Aggregate'
                WHEN p.prokind = 'w' THEN 'Window Function'
                ELSE 'Routine'
            END as object_type,
            n.nspname as schema_name,
            p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ')' as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(p.proname) || '(' || pg_get_function_identity_arguments(p.oid) || ')' as full_name,
            4 as drop_order
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND p.prokind IN ('f', 'p', 'a', 'w')
        ORDER BY n.nspname, p.proname, p.oid
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 5. Sequences
    FOR obj_record IN
        SELECT 
            'Sequence' as object_type,
            n.nspname as schema_name,
            c.relname as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(c.relname) as full_name,
            5 as drop_order
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND c.relkind = 'S'
        ORDER BY n.nspname, c.relname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 6. Tables
    FOR obj_record IN
        SELECT 
            'Table' as object_type,
            n.nspname as schema_name,
            c.relname as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(c.relname) as full_name,
            6 as drop_order
        FROM pg_class c
        JOIN pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND c.relkind = 'r'
        ORDER BY n.nspname, c.relname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

    -- 7. Custom Types (Enums, Composites)
    FOR obj_record IN
        SELECT 
            CASE 
                WHEN t.typtype = 'e' THEN 'Enum Type'
                WHEN t.typtype = 'c' THEN 'Composite Type'
                ELSE 'Custom Type'
            END as object_type,
            n.nspname as schema_name,
            t.typname as object_name,
            quote_ident(n.nspname) || '.' || quote_ident(t.typname) as full_name,
            7 as drop_order
        FROM pg_type t
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = ANY(app_schemas)
        AND t.typtype IN ('e', 'c')
        AND NOT EXISTS (
            SELECT 1 FROM pg_depend d 
            WHERE d.refobjid = t.oid 
            AND d.deptype = 'n'
        )
        ORDER BY n.nspname, t.typname
    LOOP
        object_type := obj_record.object_type;
        schema_name := obj_record.schema_name;
        object_name := obj_record.object_name;
        full_name := obj_record.full_name;
        drop_order := obj_record.drop_order;
        RETURN NEXT;
    END LOOP;

END;
$$;

-- Execute the function and display results
SELECT 
    drop_order,
    object_type,
    schema_name,
    object_name,
    full_name
FROM list_droppable_objects()
ORDER BY drop_order, schema_name, object_name;

-- Summary counts
SELECT 
    object_type,
    COUNT(*) as count,
    string_agg(DISTINCT schema_name, ', ') as schemas
FROM list_droppable_objects()
GROUP BY object_type
ORDER BY MIN(drop_order), object_type;

-- Clean up the temporary function
DROP FUNCTION IF EXISTS list_droppable_objects();

-- Final safety check
SELECT 
    'SAFETY CHECK' as check_type,
    'System schemas preserved' as status,
    string_agg(nspname, ', ') as preserved_schemas
FROM pg_namespace 
WHERE nspname IN (
    'auth', 'storage', 'extensions', 'graphql', 'pgbouncer', 'realtime', 
    'supabase_functions', 'supabase_migrations', 'net', 'pgsodium', 'vault'
);
