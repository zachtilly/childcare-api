-- Seed data for all 50 US States
-- Population data: 2023 estimates
-- Median household income: 2022 estimates (in USD)
-- Regions: Northeast, South, Midwest, West (U.S. Census Bureau regions)

INSERT INTO states (code, name, region, population, median_household_income) VALUES
-- Northeast
('CT', 'Connecticut', 'Northeast', 3626205, 83771),
('ME', 'Maine', 'Northeast', 1395722, 68251),
('MA', 'Massachusetts', 'Northeast', 7001399, 89026),
('NH', 'New Hampshire', 'Northeast', 1395231, 88841),
('NJ', 'New Jersey', 'Northeast', 9290841, 89296),
('NY', 'New York', 'Northeast', 19571216, 75157),
('PA', 'Pennsylvania', 'Northeast', 12961683, 68957),
('RI', 'Rhode Island', 'Northeast', 1095962, 74008),
('VT', 'Vermont', 'Northeast', 647464, 72431),

-- South
('AL', 'Alabama', 'South', 5108468, 56929),
('AR', 'Arkansas', 'South', 3067732, 52528),
('DE', 'Delaware', 'South', 1031890, 79325),
('FL', 'Florida', 'South', 22610726, 63062),
('GA', 'Georgia', 'South', 11029227, 66559),
('KY', 'Kentucky', 'South', 4512310, 58206),
('LA', 'Louisiana', 'South', 4573749, 54622),
('MD', 'Maryland', 'South', 6164660, 94991),
('MS', 'Mississippi', 'South', 2939690, 49111),
('NC', 'North Carolina', 'South', 10835491, 63472),
('OK', 'Oklahoma', 'South', 4053824, 57826),
('SC', 'South Carolina', 'South', 5373555, 61100),
('TN', 'Tennessee', 'South', 7126489, 61929),
('TX', 'Texas', 'South', 30503301, 66963),
('VA', 'Virginia', 'South', 8715698, 80268),
('WV', 'West Virginia', 'South', 1770071, 51248),

-- Midwest
('IL', 'Illinois', 'Midwest', 12549689, 72205),
('IN', 'Indiana', 'Midwest', 6862199, 62743),
('IA', 'Iowa', 'Midwest', 3207004, 65429),
('KS', 'Kansas', 'Midwest', 2940546, 64521),
('MI', 'Michigan', 'Midwest', 10037261, 63202),
('MN', 'Minnesota', 'Midwest', 5737915, 77720),
('MO', 'Missouri', 'Midwest', 6196156, 61043),
('NE', 'Nebraska', 'Midwest', 1978379, 66644),
('ND', 'North Dakota', 'Midwest', 783926, 68882),
('OH', 'Ohio', 'Midwest', 11785935, 62262),
('SD', 'South Dakota', 'Midwest', 919318, 63920),
('WI', 'Wisconsin', 'Midwest', 5910955, 67125),

-- West
('AK', 'Alaska', 'West', 733406, 80287),
('AZ', 'Arizona', 'West', 7431344, 65913),
('CA', 'California', 'West', 38965193, 84097),
('CO', 'Colorado', 'West', 5877610, 82254),
('HI', 'Hawaii', 'West', 1435138, 88005),
('ID', 'Idaho', 'West', 1964726, 63377),
('MT', 'Montana', 'West', 1122867, 60560),
('NV', 'Nevada', 'West', 3194176, 67276),
('NM', 'New Mexico', 'West', 2114371, 54384),
('OR', 'Oregon', 'West', 4233358, 71562),
('UT', 'Utah', 'West', 3417734, 79133),
('WA', 'Washington', 'West', 7812880, 84247),
('WY', 'Wyoming', 'West', 584057, 68002);
