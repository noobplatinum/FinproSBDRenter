--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.account (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    location text,
    age integer,
    gender text,
    role text DEFAULT 'user'::text,
    points integer DEFAULT 0,
    profile_picture text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT account_role_check CHECK ((role = ANY (ARRAY['user'::text, 'admin'::text])))
);


ALTER TABLE public.account OWNER TO renterin_owner;

--
-- Name: facilities; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.facilities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid,
    name text NOT NULL,
    condition text NOT NULL,
    CONSTRAINT facilities_condition_check CHECK ((condition = ANY (ARRAY['berfungsi'::text, 'rusak'::text, 'maintenance'::text])))
);


ALTER TABLE public.facilities OWNER TO renterin_owner;

--
-- Name: image; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.image (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    property_id uuid,
    url text NOT NULL,
    description text,
    is_thumbnail boolean DEFAULT false,
    public_id text
);


ALTER TABLE public.image OWNER TO renterin_owner;

--
-- Name: property; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.property (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    title text NOT NULL,
    description text,
    location text NOT NULL,
    size integer,
    price_per_night numeric(10,2) NOT NULL,
    rating_avg numeric(2,1) DEFAULT 0.0,
    category text,
    owner_id uuid,
    is_available boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    bedrooms integer DEFAULT 0 NOT NULL,
    bathrooms integer DEFAULT 0 NOT NULL,
    max_guests integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.property OWNER TO renterin_owner;

--
-- Name: rating; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.rating (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    property_id uuid,
    rating integer NOT NULL,
    comment text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT rating_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.rating OWNER TO renterin_owner;

--
-- Name: transaction; Type: TABLE; Schema: public; Owner: renterin_owner
--

CREATE TABLE public.transaction (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid,
    property_id uuid,
    start_date date NOT NULL,
    end_date date NOT NULL,
    status text DEFAULT 'pending'::text,
    payment_method text,
    payment_status text DEFAULT 'unpaid'::text,
    total_amount numeric(10,2) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    guest_count integer DEFAULT 1 NOT NULL,
    CONSTRAINT transaction_payment_status_check CHECK ((payment_status = ANY (ARRAY['paid'::text, 'unpaid'::text, 'failed'::text]))),
    CONSTRAINT transaction_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'confirmed'::text, 'cancelled'::text, 'completed'::text])))
);


ALTER TABLE public.transaction OWNER TO renterin_owner;

--
-- Data for Name: account; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.account (id, name, email, password_hash, location, age, gender, role, points, profile_picture, created_at) FROM stdin;
2750bab5-70f9-49ff-b47d-714dd790fac2	admin	admin@example.com	$2b$10$KM/KL1x47YEt7qnS7Ev4I.LD6zxstSj.N1ekEuLqh.zeGTaRW68DS	Kota Jakarta Timur	\N	\N	admin	0	\N	2025-05-14 11:49:32.520221
50c350f2-192c-4460-b863-1b961c4f3f30	test	test@gmail.com	$2b$10$9EdEhk57yYi3BOl3mbXma.6NWol7uMZuyHK1HAFFoPSXU5I2cFGL.	Depok	\N	\N	user	0	\N	2025-05-14 12:15:53.957326
fe392e8a-d932-48e6-a7db-a9ec9747a2b2	Wilman Saragih Sitio 	willy@gmail.com	$2b$10$pN8G.R9gc10UGb2pnvbzXe5J1VyDTm9r7YmWmzQZOjbmrcALYgmeC	Kota Jakarta Timur	\N	\N	user	0	\N	2025-05-18 10:53:35.952503
6496cd3e-6a1a-4c48-9835-54c354682cf8	TESTER	TESTER@gmail.com	$2b$10$h6FKQkK7BIEWl5V76DW8MOVAR7Eqp3X0cF.3uyNa05aMdNIcF.E3W	Kota Jakarta Timur	\N	\N	admin	0	\N	2025-05-18 18:37:16.419685
c4642a94-9f6a-414b-9c98-a598cf3cd550	Wilman Saragih Sitio 	a@gmail.com	$2b$10$jkCAcApH5psHLtD7jCNOv.Q7rincVlVEylhAru4a8jAbha7nU26yG	Kota Jakarta Timur	12	male	admin	0	\N	2025-05-18 18:45:04.295036
bcf63f90-b55e-4fc0-9cea-c28861929c91	wilman	wilman@gmail.com	$2b$10$xp/9ryqcJlNmYZkp.XPwl.BV.C.wTNB9tPQ6yuzM.iKZkVWhwk7C6	Kota Jakarta Timur	15	male	user	20001000	\N	2025-05-18 18:49:16.258462
76d7f519-8d22-4c0e-bc3d-b15169a72acf	Wilman Saragih Sitio 	admin@gmail.com	$2b$10$HckgQW96D3VTpOB.Q/wXwe9vdEbyU2edLP/d.EBBspw//asd9YZEi	Kota Jakarta Timur	19	male	user	0	\N	2025-05-20 06:33:58.250973
449d55ef-b673-4e1a-b3ba-e6dd69b3a50a	mantap	mantap@gmail.com	$2b$10$1VtJvcRyh4OS8xN0UdKJZeylwPLx9tI3e99z9JZKUOLQHJxKoYJV6	jakarta	\N	\N	user	17000	\N	2025-05-20 12:22:15.948973
7fd093d4-7626-41a2-88da-13437ccd291f	nigga max	netlab2@mail.com	$2b$10$oh6y52j94RPgx7TCu0nV9Ohl6ixtjjhnftFOHdE69yTJa6HSdn9Eq	cibaduyuk	111	male	admin	0	\N	2025-05-20 14:16:25.1032
7f671a6f-19e6-48ab-8f81-d00be183e595	ultra max	netlab@mail.com	$2b$10$yQNOTvGNBlWA3hmzykgQHuFJENQMWxirlEkzIz5Glwb.bZDnZa3MW	cibaduyut	20	prefer-not-to-say	user	999929600	\N	2025-05-20 14:12:27.279546
8d74dbca-c056-4b07-870e-d287c2369e43	pwok	xxxx@mail.com	$2b$10$vsGUN9lhMht.uVJ2SNoeCOttVpiFQEbtb8RCWW8Rv7DONnyQ87ZNe	wwwww	111	male	user	0	\N	2025-05-20 16:00:20.736422
0d0efe41-0e41-4327-899c-83be883faf1c	Dzaky Maulana	dzk@gmail.com	$2b$10$rwjXrqisSY7FltlDVe2WQOYZO8tQ6VdSydeJGwgBz6f6MXekozQi6	Depok	21	male	user	49934000	\N	2025-05-20 16:16:52.724047
b3eb949a-2bf6-454f-8a59-b2d6a664df7e	name	name@gmail.com	$2b$10$Le.lCOepV68WyvngvJAEn.SSV5N8j7Ees427Pxhi0MtzNfNOMc/xm	Kota Jakarta Timur	22	male	user	207400	\N	2025-05-25 10:34:22.339642
348467e7-151f-42ab-921b-ea107cbf59a7	Wilman Saragih Sitio 	wilmanss@gmail.com	$2b$10$e6GeR7dQTOaJgDr5fufw/OSsZ5Z7L89WMyHcoo9DhsksseW/2Mko6	Jkt	17	male	user	1832808	\N	2025-05-25 02:46:18.06524
43226d61-693f-4436-8402-e7ace6d29759	TESTER123	TESTER123@gmail.com	$2b$10$LmmW9Yc/0p/ySUYd.mIlsu5yL/qq7L83nbxKq0ozraY3Z6oJqLs26	Kota Jakarta Timur	20	male	user	548000	\N	2025-05-20 06:36:18.928276
844f9a7b-ef96-4f71-8be6-5fdaee9da79e	Abed	abednego@gmail.com	$2b$10$NZRKMArMdL6SLGphRAPsS.KYOGt7J1/1ElzwKyaHoaGbTYW.T0kd2	Kota Jakarta Timur	29	male	user	221553422	\N	2025-05-25 09:46:53.74021
\.


--
-- Data for Name: facilities; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.facilities (id, property_id, name, condition) FROM stdin;
57aa6046-c00e-4b06-87bc-f2810ba608f0	90eeeb9f-f57f-4341-98f6-76a653d40c74	WiFi	berfungsi
e0b7ab02-b907-4890-a905-6e2b5555ca3e	90eeeb9f-f57f-4341-98f6-76a653d40c74	AC	berfungsi
a2cde22f-516c-4aa8-9acc-b297dbd61976	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	WiFi	berfungsi
a1b6e2a2-2a71-40c6-bf17-3742924d0710	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	AC	berfungsi
05ee5d21-92c8-4010-96e0-a8d45076185f	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	Kitchen	berfungsi
0b5d5ac8-477d-4947-9a46-0603cf0a04b7	ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	WiFi	berfungsi
f0d03df0-3de2-43bd-a24d-18c08663f287	ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	AC	berfungsi
9a3a7635-7f38-461b-ac94-97b1562ba7cc	ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	Kitchen	berfungsi
39855f0d-69c1-44c3-9496-0621b495989b	ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	Parking	berfungsi
e7d17fae-4cb6-4ca5-8f30-6ee43e4ab0a0	41415bbf-008e-4869-9cfb-756f21cdc23a	WiFi	berfungsi
6f6a2bc2-39ff-4418-a266-55d16a499cf8	41415bbf-008e-4869-9cfb-756f21cdc23a	AC	berfungsi
c9f040c5-ea0b-4022-b8f7-735664940c37	41415bbf-008e-4869-9cfb-756f21cdc23a	Kitchen	berfungsi
f2fc96c8-5462-4a4d-be7e-beabe1c9d28f	41415bbf-008e-4869-9cfb-756f21cdc23a	Parking	berfungsi
fb7cbc87-151e-4d72-ad15-08595c762d7b	41415bbf-008e-4869-9cfb-756f21cdc23a	Pool	berfungsi
3ac71d89-784b-44e5-a655-3293863e3548	acd98cca-0119-462b-a5f6-d70fbdff0aa2	WiFi	berfungsi
1a5a702c-b515-4c26-87e3-336fbd3a77a2	acd98cca-0119-462b-a5f6-d70fbdff0aa2	AC	berfungsi
5851a924-60f6-46db-9d56-3ba4db35d471	acd98cca-0119-462b-a5f6-d70fbdff0aa2	Kitchen	berfungsi
56a4a673-491e-4c96-9015-90d66fbb4a83	acd98cca-0119-462b-a5f6-d70fbdff0aa2	Parking	berfungsi
8faaf9cc-b221-4b3b-a395-99089dec452a	acd98cca-0119-462b-a5f6-d70fbdff0aa2	Pool	berfungsi
c20b3d99-d016-4a8f-99a3-68be639f671d	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	WiFi	berfungsi
ac9d1049-51bb-4372-b662-e7726a95a3a1	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	AC	berfungsi
31ccc68d-6175-496f-84fd-0224e244501c	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	Kitchen	berfungsi
ab4ef59b-1a1e-4912-b794-70947143f3a7	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	Parking	berfungsi
83bc0e69-7c84-43bf-9593-f94c046cd3e3	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	Pool	berfungsi
1cfd9002-cc52-488d-886b-c4743e9448e1	8ea17911-574d-4ad3-b86e-9a674afadf36	WiFi	berfungsi
f40945f6-02b5-4bc5-a97d-196e51a2dad5	8ea17911-574d-4ad3-b86e-9a674afadf36	AC	berfungsi
f40cab7f-803d-4f5b-a544-18ece0aa310c	8ea17911-574d-4ad3-b86e-9a674afadf36	Kitchen	berfungsi
736b1bf0-7933-453e-9e79-f67832670899	8ea17911-574d-4ad3-b86e-9a674afadf36	Parking	berfungsi
2267e0b1-ca40-40e3-9e3b-949a79c918fa	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	WiFi	berfungsi
575c3c67-323e-47f9-b2e6-e41e22868370	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	AC	berfungsi
c68c56a4-20b5-419a-b74d-823b5a3a55a5	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	Kitchen	berfungsi
4c99acba-7cf9-470c-b21d-f3e77bdaeb4b	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	Parking	berfungsi
3ef6305a-d3a6-4a37-a923-abeaf8c983a7	c7d8bc11-06ac-48a1-8d2c-a224f757f013	WiFi	berfungsi
3805b7a3-b8f1-4a1e-90e0-bf7fa347fc3d	c7d8bc11-06ac-48a1-8d2c-a224f757f013	AC	berfungsi
4abe9932-d7cb-4c9a-b042-a51648f7190c	c7d8bc11-06ac-48a1-8d2c-a224f757f013	Kitchen	berfungsi
b3faac52-c804-440c-ab85-cc2b6eed3c26	c7d8bc11-06ac-48a1-8d2c-a224f757f013	Parking	berfungsi
fefe7c66-96af-4b9f-b4af-7d17dfb84e43	c7d8bc11-06ac-48a1-8d2c-a224f757f013	Pool	berfungsi
819c0642-44b9-4f12-9d7a-8d4bdf979c5f	cb3127ba-e902-445f-b0a2-769dfaca5698	AC	berfungsi
8c5fdc40-9d08-4f5e-a5f6-f36d9b472b20	cb3127ba-e902-445f-b0a2-769dfaca5698	WiFi	berfungsi
0db3a3f3-4509-49e9-9a3c-b3d76c0fdcdf	59b70dab-77e8-4670-a00c-30c0c0ff6a8e	WiFi	berfungsi
6a399a88-f8d2-443f-b5ca-3a56e029b8c0	59b70dab-77e8-4670-a00c-30c0c0ff6a8e	Parking	berfungsi
8f3c35f6-7dfe-43d2-9bd8-6d498f8e4b17	59b70dab-77e8-4670-a00c-30c0c0ff6a8e	Kitchen	berfungsi
99bb9fd7-399f-4d5f-9ed8-ec6b4a1b6ad5	59b70dab-77e8-4670-a00c-30c0c0ff6a8e	AC	berfungsi
\.


--
-- Data for Name: image; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.image (id, property_id, url, description, is_thumbnail, public_id) FROM stdin;
191fa69b-9c56-4fa3-9365-60cd635dfb39	90eeeb9f-f57f-4341-98f6-76a653d40c74	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747562961/renterin/properties/90eeeb9f-f57f-4341-98f6-76a653d40c74/curfla1ctvghi0r6yhyj.png	\N	t	renterin/properties/90eeeb9f-f57f-4341-98f6-76a653d40c74/curfla1ctvghi0r6yhyj
9e5c7a0a-13ea-41b9-9726-3f900a844c85	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747565432/renterin/properties/c193c3ba-a52e-48e9-91d3-fdeb7efb29e2/tw26zqshakpjgzgjywmu.png	\N	t	renterin/properties/c193c3ba-a52e-48e9-91d3-fdeb7efb29e2/tw26zqshakpjgzgjywmu
e2833b6b-190e-41e8-ba98-6aff6f161157	30b2baac-b32d-4381-9676-44c3a1482d87	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747744985/renterin/properties/30b2baac-b32d-4381-9676-44c3a1482d87/qipjwggroejfzo03xpoi.jpg	\N	t	renterin/properties/30b2baac-b32d-4381-9676-44c3a1482d87/qipjwggroejfzo03xpoi
6295b90e-dec7-45a7-b16e-49913d9c7aa8	ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747749668/renterin/properties/ead9a7ad-8425-42e0-81ef-f7b0b80bac1d/phezymbgqq6yeynjvtap.jpg	\N	t	renterin/properties/ead9a7ad-8425-42e0-81ef-f7b0b80bac1d/phezymbgqq6yeynjvtap
93cf1d11-81b4-4f7d-a785-e0cfaf9b1ccf	41415bbf-008e-4869-9cfb-756f21cdc23a	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747749861/renterin/properties/41415bbf-008e-4869-9cfb-756f21cdc23a/wh9fuw0dfd4cbhvnyzdc.jpg	\N	t	renterin/properties/41415bbf-008e-4869-9cfb-756f21cdc23a/wh9fuw0dfd4cbhvnyzdc
23cf32fe-83bf-4abf-97a0-3588eb299b70	acd98cca-0119-462b-a5f6-d70fbdff0aa2	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747749974/renterin/properties/acd98cca-0119-462b-a5f6-d70fbdff0aa2/cdahi2hbsv0wbahiab98.jpg	\N	t	renterin/properties/acd98cca-0119-462b-a5f6-d70fbdff0aa2/cdahi2hbsv0wbahiab98
558f0fc8-b6c1-43cc-a76e-5d9ba5c3fd82	bfe361ed-cfad-4b40-b7c2-327c78fff5ed	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747750162/renterin/properties/bfe361ed-cfad-4b40-b7c2-327c78fff5ed/o2fs0g1gdnykp5jnankv.jpg	\N	t	renterin/properties/bfe361ed-cfad-4b40-b7c2-327c78fff5ed/o2fs0g1gdnykp5jnankv
fab13aa2-ef41-4fc2-ae51-3ec79f5d9c1e	8ea17911-574d-4ad3-b86e-9a674afadf36	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747750302/renterin/properties/8ea17911-574d-4ad3-b86e-9a674afadf36/cvoclxupwx5me0uwte8w.webp	\N	t	renterin/properties/8ea17911-574d-4ad3-b86e-9a674afadf36/cvoclxupwx5me0uwte8w
77ddb2e5-7997-4ff2-a3a3-ad39ee295f0e	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747750521/renterin/properties/4c8ef675-b5a6-4995-8f8b-6077016ae6c8/chxqjpfxw5nkoyopcb5i.webp	\N	t	renterin/properties/4c8ef675-b5a6-4995-8f8b-6077016ae6c8/chxqjpfxw5nkoyopcb5i
034da50d-b14b-41a0-8583-a2d859205521	c7d8bc11-06ac-48a1-8d2c-a224f757f013	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747750647/renterin/properties/c7d8bc11-06ac-48a1-8d2c-a224f757f013/y0wyuvhyon2a8qe8lchy.jpg	\N	t	renterin/properties/c7d8bc11-06ac-48a1-8d2c-a224f757f013/y0wyuvhyon2a8qe8lchy
e4df9244-d553-4b69-9d3e-fd995bae1c59	59b70dab-77e8-4670-a00c-30c0c0ff6a8e	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747750749/renterin/properties/59b70dab-77e8-4670-a00c-30c0c0ff6a8e/he4ns4ygulmd6urzbneu.webp	\N	t	renterin/properties/59b70dab-77e8-4670-a00c-30c0c0ff6a8e/he4ns4ygulmd6urzbneu
b36e2fe2-fb47-4716-9076-2e18e3213464	cb3127ba-e902-445f-b0a2-769dfaca5698	https://res.cloudinary.com/dhdf0lkkt/image/upload/v1747752545/renterin/properties/cb3127ba-e902-445f-b0a2-769dfaca5698/nwyn27iouvsppzlq9u0t.png	\N	t	renterin/properties/cb3127ba-e902-445f-b0a2-769dfaca5698/nwyn27iouvsppzlq9u0t
\.


--
-- Data for Name: property; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.property (id, title, description, location, size, price_per_night, rating_avg, category, owner_id, is_available, created_at, bedrooms, bathrooms, max_guests) FROM stdin;
c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	tester	hahahihi	Kota Jakarta Timur	123	3000.00	0.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-18 10:50:29.883346	1	1	2
30b2baac-b32d-4381-9676-44c3a1482d87	Hana Kost	Kost terbaik se-depok kota	Depok	50	152000.00	0.0	kost	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 12:43:03.78139	1	1	2
ead9a7ad-8425-42e0-81ef-f7b0b80bac1d	Kost Griya Lembah		Depok	115	50000.00	0.0	kost	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:01:04.946396	1	1	2
41415bbf-008e-4869-9cfb-756f21cdc23a	Apartement Mahata		Depok	150	250000.00	0.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:04:17.502077	2	1	4
acd98cca-0119-462b-a5f6-d70fbdff0aa2	Avencio		Depok	153	350000.00	0.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:06:11.140954	1	1	2
bfe361ed-cfad-4b40-b7c2-327c78fff5ed	Apartement Rakuna		jakarta	162	850000.00	0.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:09:19.730352	1	1	2
8ea17911-574d-4ad3-b86e-9a674afadf36	Kost Sutet		Depok	120	60000.00	0.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:11:35.063711	1	1	2
4c8ef675-b5a6-4995-8f8b-6077016ae6c8	Kost Sihyun	Tempat singgah ternyaman para mahasiswa	Depok	124	64000.00	0.0	kost	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:15:19.170701	1	1	2
c7d8bc11-06ac-48a1-8d2c-a224f757f013	Villa Lambada		Bali	400	950000.00	0.0	villa	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:17:25.280692	1	1	2
cb3127ba-e902-445f-b0a2-769dfaca5698	1	1	1	1	10000.00	0.0	apartment	7fd093d4-7626-41a2-88da-13437ccd291f	t	2025-05-20 14:49:02.952802	2	2	1
59b70dab-77e8-4670-a00c-30c0c0ff6a8e	Villa Arsta	zzzz	Bandung	500	840000.00	0.0	villa	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-20 14:19:06.523917	1	1	2
90eeeb9f-f57f-4341-98f6-76a653d40c74	123	131	Kota Jakarta Timur	0	30000.00	5.0	apartment	2750bab5-70f9-49ff-b47d-714dd790fac2	t	2025-05-18 10:09:19.269798	0	0	1
\.


--
-- Data for Name: rating; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.rating (id, user_id, property_id, rating, comment, created_at) FROM stdin;
28442573-0252-4dd0-96b4-1c23ab3ef937	43226d61-693f-4436-8402-e7ace6d29759	90eeeb9f-f57f-4341-98f6-76a653d40c74	5	keren	2025-05-25 13:09:27.523081
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: public; Owner: renterin_owner
--

COPY public.transaction (id, user_id, property_id, start_date, end_date, status, payment_method, payment_status, total_amount, created_at, guest_count) FROM stdin;
950284db-74bb-4b01-8505-8737c1aba573	348467e7-151f-42ab-921b-ea107cbf59a7	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 02:47:43.916866	1
76768640-3d33-4557-afdf-9957886e8423	844f9a7b-ef96-4f71-8be6-5fdaee9da79e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 09:49:55.062798	1
5e480348-d0f7-4ef2-af92-0a77c28b4ce8	844f9a7b-ef96-4f71-8be6-5fdaee9da79e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 09:51:51.761161	1
ffafa2ac-0aab-4a9c-89e3-831390690f0d	844f9a7b-ef96-4f71-8be6-5fdaee9da79e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 10:32:38.150526	1
a61fbd06-270e-4fa0-9dd0-f1b5198b3422	844f9a7b-ef96-4f71-8be6-5fdaee9da79e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 10:33:38.280844	1
696faa15-9bea-4c38-996a-02d6889c037e	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 10:35:05.720598	1
af928d8e-c6ac-459f-95a4-af262718ff72	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 10:57:07.278482	1
899b34ed-6bee-406a-9c48-f38975bde9d9	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 11:21:43.519543	1
3977fd6a-8bb6-46fd-9093-f366aabf5042	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	2025-05-25	2025-05-26	confirmed	points	paid	70400.00	2025-05-25 11:23:07.577283	1
61c24406-7105-4dd8-ac89-df720a51931e	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-25	2025-05-26	confirmed	points	paid	33000.00	2025-05-25 11:37:10.244703	1
aa201df9-dbd8-479f-908d-72d9c4f02b07	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	cb3127ba-e902-445f-b0a2-769dfaca5698	2025-05-25	2025-05-26	confirmed	points	paid	11000.00	2025-05-25 11:41:53.74566	1
9374af5c-54a8-4f8d-92dd-7c89c55e6e9c	b3eb949a-2bf6-454f-8a59-b2d6a664df7e	cb3127ba-e902-445f-b0a2-769dfaca5698	2025-05-25	2025-05-26	confirmed	points	paid	11000.00	2025-05-25 12:01:05.494163	1
7605ef08-d624-4bb4-80ba-25d5001add6c	\N	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 06:39:22.410344	1
4a02a044-db45-406b-8270-e866eb5f8ab0	\N	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 06:40:22.802273	1
db325f17-c6e7-4b1d-adb0-1bcc112c042a	43226d61-693f-4436-8402-e7ace6d29759	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	2025-05-20	2025-05-21	completed	points	paid	3300.00	2025-05-20 06:42:14.396854	1
2532c39b-19ae-4ffb-8ce5-b527cd7d39ba	43226d61-693f-4436-8402-e7ace6d29759	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	2025-05-20	2025-05-21	completed	points	paid	3300.00	2025-05-20 06:42:55.927319	1
9b691457-58c2-4384-a2be-229cc761f0fe	43226d61-693f-4436-8402-e7ace6d29759	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 06:49:56.607228	1
eadc54c1-3546-4f10-a2f7-681011fcdcec	43226d61-693f-4436-8402-e7ace6d29759	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 06:50:36.677875	1
1622e3e6-65b4-4f4a-916f-8c0551749c2f	43226d61-693f-4436-8402-e7ace6d29759	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 07:50:35.944001	1
8ba7b80e-c698-4dc8-b90b-19dcc17cfd7b	43226d61-693f-4436-8402-e7ace6d29759	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	2025-05-20	2025-05-21	completed	points	paid	3300.00	2025-05-20 07:55:00.130271	1
3eb2f398-b1ca-4c2b-82d5-ecad3012500e	43226d61-693f-4436-8402-e7ace6d29759	c193c3ba-a52e-48e9-91d3-fdeb7efb29e2	2025-05-20	2025-05-21	completed	points	paid	3300.00	2025-05-20 11:45:32.523626	1
af2d20e2-2a45-48cc-a7bd-aae8433ad175	43226d61-693f-4436-8402-e7ace6d29759	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 11:50:38.996592	1
636c4c60-ec60-4cc2-8270-44d1dd468915	449d55ef-b673-4e1a-b3ba-e6dd69b3a50a	90eeeb9f-f57f-4341-98f6-76a653d40c74	2025-05-20	2025-05-21	completed	points	paid	33000.00	2025-05-20 12:32:57.272515	1
c6d4f2bf-0e39-41f8-965f-076437525bd6	43226d61-693f-4436-8402-e7ace6d29759	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-20	2025-05-21	completed	points	paid	167200.00	2025-05-20 12:45:35.772558	1
a49bf5f7-d962-4e40-8cda-995026c22934	7f671a6f-19e6-48ab-8f81-d00be183e595	4c8ef675-b5a6-4995-8f8b-6077016ae6c8	2025-05-20	2025-05-21	completed	points	paid	70400.00	2025-05-20 15:07:28.067026	1
8e54d33d-d4e9-47ea-9e79-51d7281b4ec1	0d0efe41-0e41-4327-899c-83be883faf1c	8ea17911-574d-4ad3-b86e-9a674afadf36	2025-05-20	2025-05-21	completed	points	paid	66000.00	2025-05-20 16:18:06.151619	1
5928ef1f-1a26-4758-a9b3-6b2d2ea1cc39	43226d61-693f-4436-8402-e7ace6d29759	c7d8bc11-06ac-48a1-8d2c-a224f757f013	2025-05-25	2025-05-26	confirmed	points	paid	1045000.00	2025-05-25 15:47:48.154134	1
55446c57-af40-459f-bf49-a80b1f3e70ed	43226d61-693f-4436-8402-e7ace6d29759	30b2baac-b32d-4381-9676-44c3a1482d87	2025-05-25	2025-05-26	confirmed	points	paid	167200.00	2025-05-25 18:08:22.342186	1
\.


--
-- Name: account account_email_key; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_email_key UNIQUE (email);


--
-- Name: account account_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT account_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_pkey PRIMARY KEY (id);


--
-- Name: image image_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_pkey PRIMARY KEY (id);


--
-- Name: property property_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.property
    ADD CONSTRAINT property_pkey PRIMARY KEY (id);


--
-- Name: rating rating_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_pkey PRIMARY KEY (id);


--
-- Name: rating rating_user_id_property_id_key; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_user_id_property_id_key UNIQUE (user_id, property_id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (id);


--
-- Name: facilities facilities_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.facilities
    ADD CONSTRAINT facilities_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.property(id) ON DELETE CASCADE;


--
-- Name: image image_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.image
    ADD CONSTRAINT image_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.property(id) ON DELETE CASCADE;


--
-- Name: property property_owner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.property
    ADD CONSTRAINT property_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.account(id) ON DELETE SET NULL;


--
-- Name: rating rating_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.property(id) ON DELETE CASCADE;


--
-- Name: rating rating_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.rating
    ADD CONSTRAINT rating_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: transaction transaction_property_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.property(id) ON DELETE CASCADE;


--
-- Name: transaction transaction_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: renterin_owner
--

ALTER TABLE ONLY public.transaction
    ADD CONSTRAINT transaction_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.account(id) ON DELETE CASCADE;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

