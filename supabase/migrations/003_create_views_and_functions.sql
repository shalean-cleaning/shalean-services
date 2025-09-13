-- Migration: Create Views and Functions
-- Description: Views for price calculation and common queries

-- View for cleaner availability with timezone handling
CREATE VIEW cleaner_availability_view AS
SELECT 
    c.id as cleaner_id,
    c.profile_id,
    p.first_name,
    p.last_name,
    c.rating,
    c.total_ratings,
    av.day_of_week,
    av.start_time,
    av.end_time,
    av.is_active
FROM cleaners c
JOIN profiles p ON c.profile_id = p.id
JOIN availability_slots av ON c.id = av.cleaner_id
WHERE c.is_available = true 
AND av.is_active = true
AND p.is_active = true;

-- View for booking details with pricing
CREATE VIEW booking_details_view AS
SELECT 
    b.id,
    b.customer_id,
    b.cleaner_id,
    b.suburb_id,
    b.service_id,
    b.booking_date,
    b.start_time,
    b.end_time,
    b.status,
    b.total_price,
    b.notes,
    b.special_instructions,
    b.created_at,
    b.updated_at,
    -- Customer details
    cp.first_name as customer_first_name,
    cp.last_name as customer_last_name,
    cp.email as customer_email,
    cp.phone as customer_phone,
    -- Cleaner details
    clp.first_name as cleaner_first_name,
    clp.last_name as cleaner_last_name,
    clp.phone as cleaner_phone,
    -- Service details
    s.name as service_name,
    s.description as service_description,
    s.duration_minutes,
    -- Location details
    sub.name as suburb_name,
    sub.postcode,
    sub.delivery_fee,
    r.name as region_name,
    r.state
FROM bookings b
LEFT JOIN profiles cp ON b.customer_id = cp.id
LEFT JOIN cleaners cl ON b.cleaner_id = cl.id
LEFT JOIN profiles clp ON cl.profile_id = clp.id
LEFT JOIN services s ON b.service_id = s.id
LEFT JOIN suburbs sub ON b.suburb_id = sub.id
LEFT JOIN regions r ON sub.region_id = r.id;

-- View for service pricing with all components
CREATE VIEW service_pricing_view AS
SELECT 
    s.id as service_id,
    s.name as service_name,
    s.base_price,
    s.duration_minutes,
    sc.name as category_name,
    -- Calculate total extras price
    COALESCE(SUM(be.price * be.quantity), 0) as extras_total,
    -- Calculate delivery fee
    sub.delivery_fee,
    -- Calculate service fee (example: 10% of base price)
    (s.base_price * 0.10) as service_fee,
    -- Total price calculation
    (s.base_price + COALESCE(SUM(be.price * be.quantity), 0) + sub.delivery_fee + (s.base_price * 0.10)) as total_price
FROM services s
LEFT JOIN service_categories sc ON s.category_id = sc.id
LEFT JOIN booking_extras be ON s.id = be.extra_id
LEFT JOIN suburbs sub ON true -- This would be filtered by actual suburb in practice
GROUP BY s.id, s.name, s.base_price, s.duration_minutes, sc.name, sub.delivery_fee;

-- Function to calculate booking price
CREATE OR REPLACE FUNCTION calculate_booking_price(
    p_service_id UUID,
    p_suburb_id UUID,
    p_extras JSONB DEFAULT '[]'::JSONB
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
    base_price DECIMAL(10,2);
    delivery_fee DECIMAL(10,2);
    service_fee DECIMAL(10,2);
    extras_total DECIMAL(10,2) := 0;
    extra_item JSONB;
BEGIN
    -- Get base price and delivery fee
    SELECT s.base_price, sub.delivery_fee
    INTO base_price, delivery_fee
    FROM services s
    CROSS JOIN suburbs sub
    WHERE s.id = p_service_id AND sub.id = p_suburb_id;
    
    -- Calculate service fee (10% of base price)
    service_fee := base_price * 0.10;
    
    -- Calculate extras total
    FOR extra_item IN SELECT * FROM jsonb_array_elements(p_extras)
    LOOP
        extras_total := extras_total + (
            (extra_item->>'price')::DECIMAL(10,2) * 
            (extra_item->>'quantity')::INTEGER
        );
    END LOOP;
    
    RETURN base_price + delivery_fee + service_fee + extras_total;
END;
$$ LANGUAGE plpgsql;

-- Function to get available cleaners for a specific time slot
CREATE OR REPLACE FUNCTION get_available_cleaners(
    p_suburb_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME
)
RETURNS TABLE (
    cleaner_id UUID,
    cleaner_name TEXT,
    rating DECIMAL(3,2),
    total_ratings INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        c.id as cleaner_id,
        CONCAT(p.first_name, ' ', p.last_name) as cleaner_name,
        c.rating,
        c.total_ratings
    FROM cleaners c
    JOIN profiles p ON c.profile_id = p.id
    JOIN cleaner_locations cl ON c.id = cl.cleaner_id
    JOIN availability_slots av ON c.id = av.cleaner_id
    WHERE c.is_available = true
    AND p.is_active = true
    AND cl.suburb_id = p_suburb_id
    AND av.day_of_week = EXTRACT(DOW FROM p_booking_date)
    AND av.is_active = true
    AND av.start_time <= p_start_time
    AND av.end_time >= p_end_time
    AND NOT EXISTS (
        SELECT 1 FROM bookings b
        WHERE b.cleaner_id = c.id
        AND b.booking_date = p_booking_date
        AND b.status NOT IN ('CANCELLED')
        AND (
            (b.start_time <= p_start_time AND b.end_time > p_start_time) OR
            (b.start_time < p_end_time AND b.end_time >= p_end_time) OR
            (b.start_time >= p_start_time AND b.end_time <= p_end_time)
        )
    )
    ORDER BY c.rating DESC, c.total_ratings DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to create a booking with automatic price calculation
CREATE OR REPLACE FUNCTION create_booking_with_pricing(
    p_customer_id UUID,
    p_suburb_id UUID,
    p_service_id UUID,
    p_booking_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_extras JSONB DEFAULT '[]'::JSONB,
    p_notes TEXT DEFAULT NULL,
    p_special_instructions TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    booking_id UUID;
    calculated_price DECIMAL(10,2);
BEGIN
    -- Calculate the total price
    calculated_price := calculate_booking_price(p_service_id, p_suburb_id, p_extras);
    
    -- Create the booking
    INSERT INTO bookings (
        customer_id,
        suburb_id,
        service_id,
        booking_date,
        start_time,
        end_time,
        total_price,
        notes,
        special_instructions
    ) VALUES (
        p_customer_id,
        p_suburb_id,
        p_service_id,
        p_booking_date,
        p_start_time,
        p_end_time,
        calculated_price,
        p_notes,
        p_special_instructions
    ) RETURNING id INTO booking_id;
    
    -- Add booking extras if any
    IF p_extras != '[]'::JSONB THEN
        INSERT INTO booking_extras (booking_id, extra_id, quantity, price)
        SELECT 
            booking_id,
            (extra_item->>'extra_id')::UUID,
            (extra_item->>'quantity')::INTEGER,
            (extra_item->>'price')::DECIMAL(10,2)
        FROM jsonb_array_elements(p_extras) as extra_item;
    END IF;
    
    RETURN booking_id;
END;
$$ LANGUAGE plpgsql;

-- View for cleaner performance metrics
CREATE VIEW cleaner_performance_view AS
SELECT 
    c.id as cleaner_id,
    CONCAT(p.first_name, ' ', p.last_name) as cleaner_name,
    c.rating,
    c.total_ratings,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
    AVG(CASE WHEN b.status = 'COMPLETED' THEN b.total_price END) as avg_booking_value,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END) as total_revenue
FROM cleaners c
JOIN profiles p ON c.profile_id = p.id
LEFT JOIN bookings b ON c.id = b.cleaner_id
WHERE c.is_available = true
GROUP BY c.id, p.first_name, p.last_name, c.rating, c.total_ratings;

-- View for customer booking history
CREATE VIEW customer_booking_history_view AS
SELECT 
    p.id as customer_id,
    CONCAT(p.first_name, ' ', p.last_name) as customer_name,
    p.email,
    COUNT(b.id) as total_bookings,
    COUNT(CASE WHEN b.status = 'COMPLETED' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelled_bookings,
    SUM(CASE WHEN b.status = 'COMPLETED' THEN b.total_price ELSE 0 END) as total_spent,
    AVG(CASE WHEN b.status = 'COMPLETED' THEN b.total_price END) as avg_booking_value,
    MAX(b.booking_date) as last_booking_date
FROM profiles p
LEFT JOIN bookings b ON p.id = b.customer_id
WHERE p.role = 'CUSTOMER'
GROUP BY p.id, p.first_name, p.last_name, p.email;
