-- Create sample shifts for the week 20-26 July 2025 to test token integration
INSERT INTO scheduled_shifts (business_id, branch_id, shift_date, start_time, end_time, status, is_archived, role, created_at, updated_at) VALUES 
-- Monday shifts
('ceaee44e-663e-4c31-b873-a3a745921d12', '2ea25a1c-498d-40f6-904b-4d85c555077f', '2025-07-21', '08:00:00', '16:00:00', 'pending', false, 'עובד מטבח', now(), now()),
('ceaee44e-663e-4c31-b873-a3a745921d12', '3d6c31d1-7c4a-4996-a8e1-98ced5320a5b', '2025-07-21', '09:00:00', '17:00:00', 'pending', false, 'קופאי', now(), now()),

-- Tuesday shifts  
('ceaee44e-663e-4c31-b873-a3a745921d12', '0bf3c589-4a65-4672-8ce6-88f7c0724214', '2025-07-22', '10:00:00', '18:00:00', 'pending', false, 'מוכר', now(), now()),
('ceaee44e-663e-4c31-b873-a3a745921d12', '2ea25a1c-498d-40f6-904b-4d85c555077f', '2025-07-22', '14:00:00', '22:00:00', 'pending', false, 'עובד לילה', now(), now()),

-- Wednesday shifts
('ceaee44e-663e-4c31-b873-a3a745921d12', '3d6c31d1-7c4a-4996-a8e1-98ced5320a5b', '2025-07-23', '07:00:00', '15:00:00', 'pending', false, 'עובד בוקר', now(), now()),
('ceaee44e-663e-663e-4c31-b873-a3a745921d12', '0bf3c589-4a65-4672-8ce6-88f7c0724214', '2025-07-23', '16:00:00', '23:00:00', 'pending', false, 'מנהל משמרת', now(), now());