-- Create related_products table
CREATE TABLE IF NOT EXISTS related_products (
    id SERIAL PRIMARY KEY,
    product_id INTEGER NOT NULL,
    related_product_id INTEGER NOT NULL,
    relation_type VARCHAR(50),
    priority INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(product_id, related_product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_related_products_product_id ON related_products(product_id);
CREATE INDEX IF NOT EXISTS idx_related_products_related_id ON related_products(related_product_id);

-- Insert some sample related products (optional)
INSERT INTO related_products (product_id, related_product_id, relation_type, priority)
VALUES 
(1, 2, 'similar', 10),
(1, 3, 'complementary', 5),
(1, 4, 'upgrade', 8)
ON CONFLICT (product_id, related_product_id) DO NOTHING; 