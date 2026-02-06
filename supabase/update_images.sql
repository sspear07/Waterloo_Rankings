-- Update Waterloo Flavor Images
-- Run this in Supabase SQL Editor to add images to all flavors

-- Classic flavors (flavor-detail images)
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/09_black_cherry_flavor-detail-1.png' WHERE name = 'Black Cherry';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/15_grape_flavor-detail-1.png' WHERE name = 'Grape';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/08_lemon_flavor-detail-1.png' WHERE name = 'Lemon-Lime';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/12_strawberry_flavor-detail-1.png' WHERE name = 'Strawberry';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/11_peach_flavor-detail-1.png' WHERE name = 'Peach';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/14_watermelon_flavor-detail-1.png' WHERE name = 'Watermelon';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/07_cherry-limeade_flavor-detail-1.png' WHERE name = 'Cherry Limeade';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/04_orange_vanilla_flavor-detail-1.png' WHERE name = 'Orange Vanilla';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/06_blackberry_flavor-detail-1.png' WHERE name = 'Blackberry Lemonade';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/10_summer_berry_flavor-detail-1.png' WHERE name = 'Summer Berry';

-- Newer flavors (hero/can images)
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2026/01/2510_BananaBerryBliss_Can_LessWetRender_432x688.png' WHERE name = 'Banana Berry Bliss';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2026/01/2510_HomePgHERO_Can_MelonMedley_1300x888_v7_optimized.png' WHERE name = 'Melon Medley';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2026/01/2510_HomePgHERO_Can_LemonItalianIce_1300x888_v2B.png' WHERE name = 'Lemon Italian Ice';

-- Flavors with scaled hero images (these show the can nicely too)
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/tropical-fruit_bg-flavor-detail-scaled.jpg' WHERE name = 'Tropical Fruit';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/Guava-Berry-2-scaled.jpg' WHERE name = 'Guava Berry';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/Raspberry-Nectarine-scaled.jpg' WHERE name = 'Raspberry Nectarine';
UPDATE flavors SET image_url = 'https://www.drinkwaterloo.com/wp-content/uploads/2023/04/Ruby-Red-Tangerine-scaled.jpg' WHERE name = 'Ruby Red Tangerine';

-- Verify the updates
SELECT name, image_url FROM flavors ORDER BY name;
