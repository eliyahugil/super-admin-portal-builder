-- Drop existing policies on products
DROP POLICY IF EXISTS "Business admins can manage products" ON products;
DROP POLICY IF EXISTS "Users can view products in their business" ON products;

-- Create proper RLS policies for products using get_user_business_ids()
CREATE POLICY "Business users can manage products"
ON products
FOR ALL
USING (business_id = ANY (get_user_business_ids()))
WITH CHECK (business_id = ANY (get_user_business_ids()));