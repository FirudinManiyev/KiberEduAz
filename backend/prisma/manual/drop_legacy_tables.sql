-- Leftovers from the unrelated tourism project this Supabase instance was
-- created for. All seven were verified empty (0 rows) on 2026-08-11 before the
-- KiberEduAz schema was installed alongside them.
--
-- Run this only after confirming nothing still depends on them.

drop table if exists public."CoinTransaction" cascade;
drop table if exists public."Review" cascade;
drop table if exists public."Booking" cascade;
drop table if exists public."Place" cascade;
drop table if exists public."EntrepreneurProfile" cascade;
drop table if exists public."TouristProfile" cascade;
drop table if exists public."User" cascade;
