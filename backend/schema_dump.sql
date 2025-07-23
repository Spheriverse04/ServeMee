--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.9 (Ubuntu 16.9-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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


--
-- Name: bookings_status_enum; Type: TYPE; Schema: public; Owner: servemee_user
--

CREATE TYPE public.bookings_status_enum AS ENUM (
    'PENDING',
    'CONFIRMED',
    'CANCELLED',
    'COMPLETED',
    'REJECTED'
);


ALTER TYPE public.bookings_status_enum OWNER TO servemee_user;

--
-- Name: service_requests_status_enum; Type: TYPE; Schema: public; Owner: servemee_user
--

CREATE TYPE public.service_requests_status_enum AS ENUM (
    'PENDING',
    'ACCEPTED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED',
    'REJECTED'
);


ALTER TYPE public.service_requests_status_enum OWNER TO servemee_user;

--
-- Name: service_types_base_fare_type_enum; Type: TYPE; Schema: public; Owner: servemee_user
--

CREATE TYPE public.service_types_base_fare_type_enum AS ENUM (
    'hourly',
    'fixed',
    'per_km',
    'per_item',
    'custom'
);


ALTER TYPE public.service_types_base_fare_type_enum OWNER TO servemee_user;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: servemee_user
--

CREATE TYPE public.users_role_enum AS ENUM (
    'consumer',
    'service_provider',
    'admin'
);


ALTER TYPE public.users_role_enum OWNER TO servemee_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    "startTime" timestamp with time zone NOT NULL,
    "endTime" timestamp with time zone NOT NULL,
    "agreedPrice" numeric(10,2) NOT NULL,
    status public.bookings_status_enum DEFAULT 'PENDING'::public.bookings_status_enum NOT NULL,
    notes text,
    consumer_id uuid NOT NULL,
    service_id uuid NOT NULL,
    service_provider_id uuid,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.bookings OWNER TO servemee_user;

--
-- Name: countries; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.countries (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    iso2 character varying(2),
    iso3 character varying(3),
    numeric_code character varying(3),
    phone_code character varying(255),
    capital character varying(255),
    currency character varying(255),
    currency_name character varying(255),
    currency_symbol character varying(255),
    tld character varying(255),
    native character varying(255),
    region character varying(255),
    subregion character varying(255),
    timezones jsonb,
    latitude numeric(10,8),
    longitude numeric(11,8),
    emoji character varying(255),
    emoji_u character varying(255),
    flag boolean DEFAULT false NOT NULL,
    wiki_data_id character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.countries OWNER TO servemee_user;

--
-- Name: districts; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.districts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    state_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.districts OWNER TO servemee_user;

--
-- Name: localities; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.localities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    district_id uuid,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.localities OWNER TO servemee_user;

--
-- Name: migrations; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    "timestamp" bigint NOT NULL,
    name character varying NOT NULL
);


ALTER TABLE public.migrations OWNER TO servemee_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: servemee_user
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.migrations_id_seq OWNER TO servemee_user;

--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: servemee_user
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: ratings_reviews; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.ratings_reviews (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_request_id uuid NOT NULL,
    consumer_id uuid NOT NULL,
    service_provider_id uuid NOT NULL,
    rating integer NOT NULL,
    review_text text,
    is_verified boolean DEFAULT true NOT NULL,
    helpful_count integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "CHK_5701502bb500f5d30f0f59c934" CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.ratings_reviews OWNER TO servemee_user;

--
-- Name: service_categories; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_categories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    icon_url text,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_categories OWNER TO servemee_user;

--
-- Name: service_provider_localities; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_provider_localities (
    service_provider_id uuid NOT NULL,
    locality_id uuid NOT NULL
);


ALTER TABLE public.service_provider_localities OWNER TO servemee_user;

--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_providers (
    user_id uuid NOT NULL,
    company_name character varying(255),
    description text,
    average_rating numeric(3,2) DEFAULT '0'::numeric NOT NULL,
    total_ratings integer DEFAULT 0 NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_providers OWNER TO servemee_user;

--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_type_id uuid NOT NULL,
    consumer_id uuid NOT NULL,
    service_provider_id uuid,
    status public.service_requests_status_enum DEFAULT 'PENDING'::public.service_requests_status_enum NOT NULL,
    locality_id uuid,
    address text,
    notes text,
    scheduled_time timestamp with time zone,
    otp_code character varying(10),
    total_cost numeric(10,2),
    accepted_at timestamp with time zone,
    completed_at timestamp with time zone,
    cancelled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_requests OWNER TO servemee_user;

--
-- Name: service_types; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    category_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    base_fare_type public.service_types_base_fare_type_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    additional_attributes jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_types OWNER TO servemee_user;

--
-- Name: services; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    image_url text,
    base_fare numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    service_type_id uuid NOT NULL,
    service_provider_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO servemee_user;

--
-- Name: states; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.states (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    country_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.states OWNER TO servemee_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firebase_uid character varying NOT NULL,
    email character varying NOT NULL,
    phone_number character varying(20),
    display_name character varying(100),
    role public.users_role_enum DEFAULT 'consumer'::public.users_role_enum NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO servemee_user;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: states PK_09ab30ca0975c02656483265f4f; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT "PK_09ab30ca0975c02656483265f4f" PRIMARY KEY (id);


--
-- Name: service_types PK_1dc93417a097cdee3491f39d7cc; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT "PK_1dc93417a097cdee3491f39d7cc" PRIMARY KEY (id);


--
-- Name: service_provider_localities PK_1de4df8654e7df5ea7c328ac9b6; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT "PK_1de4df8654e7df5ea7c328ac9b6" PRIMARY KEY (service_provider_id, locality_id);


--
-- Name: service_providers PK_2cc7c52b39288cadfad8a0ad63c; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT "PK_2cc7c52b39288cadfad8a0ad63c" PRIMARY KEY (user_id);


--
-- Name: ratings_reviews PK_7b074af47390c638b415e2f7376; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT "PK_7b074af47390c638b415e2f7376" PRIMARY KEY (id);


--
-- Name: localities PK_7fa2291f3588423d800e02a8479; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.localities
    ADD CONSTRAINT "PK_7fa2291f3588423d800e02a8479" PRIMARY KEY (id);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


--
-- Name: districts PK_972a72ff4e3bea5c7f43a2b98af; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "PK_972a72ff4e3bea5c7f43a2b98af" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: countries PK_b2d7006793e8697ab3ae2deff18; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY (id);


--
-- Name: services PK_ba2d347a3168a296416c6c5ccb2; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "PK_ba2d347a3168a296416c6c5ccb2" PRIMARY KEY (id);


--
-- Name: bookings PK_bee6805982cc1e248e94ce94957; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY (id);


--
-- Name: service_requests PK_ee60bcd826b7e130bfbd97daf66; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT "PK_ee60bcd826b7e130bfbd97daf66" PRIMARY KEY (id);


--
-- Name: service_categories PK_fe4da5476c4ffe5aa2d3524ae68; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT "PK_fe4da5476c4ffe5aa2d3524ae68" PRIMARY KEY (id);


--
-- Name: users UQ_0fd54ced5cc75f7cb92925dd803; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_0fd54ced5cc75f7cb92925dd803" UNIQUE (firebase_uid);


--
-- Name: districts UQ_2902a526d13993ccec64a9d5810; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "UQ_2902a526d13993ccec64a9d5810" UNIQUE (name, state_id);


--
-- Name: service_categories UQ_7ef2e28b495d09a4eb28997c653; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT "UQ_7ef2e28b495d09a4eb28997c653" UNIQUE (name);


--
-- Name: localities UQ_88c3b7404cf8430b49ce0041c87; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.localities
    ADD CONSTRAINT "UQ_88c3b7404cf8430b49ce0041c87" UNIQUE (name);


--
-- Name: countries UQ_9706e3c52695ce44a202f24c26b; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT "UQ_9706e3c52695ce44a202f24c26b" UNIQUE (iso2);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: countries UQ_a4b58a9f3c44431b37623a096aa; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT "UQ_a4b58a9f3c44431b37623a096aa" UNIQUE (numeric_code);


--
-- Name: countries UQ_b29f9172f8b660e7834000c4246; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.countries
    ADD CONSTRAINT "UQ_b29f9172f8b660e7834000c4246" UNIQUE (iso3);


--
-- Name: ratings_reviews UQ_e8bef70d6ae75899c8de2bdf7ac; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT "UQ_e8bef70d6ae75899c8de2bdf7ac" UNIQUE (service_request_id);


--
-- Name: states UQ_fd995ee0bec1758b056730f3b84; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT "UQ_fd995ee0bec1758b056730f3b84" UNIQUE (name, country_id);


--
-- Name: IDX_0e7314e9e91cbf8188807543d5; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_0e7314e9e91cbf8188807543d5" ON public.service_provider_localities USING btree (service_provider_id);


--
-- Name: IDX_18b176b7f592f3a1c55d5e43a8; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_18b176b7f592f3a1c55d5e43a8" ON public.districts USING btree (state_id);


--
-- Name: IDX_2c0b2ee39608f22fcd6a9dd977; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_2c0b2ee39608f22fcd6a9dd977" ON public.service_requests USING btree (service_provider_id);


--
-- Name: IDX_4608c7dc7c2a928d566741952e; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_4608c7dc7c2a928d566741952e" ON public.service_requests USING btree (locality_id);


--
-- Name: IDX_af9e647dbb4d4bf3f99f72c20a; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_af9e647dbb4d4bf3f99f72c20a" ON public.service_provider_localities USING btree (locality_id);


--
-- Name: IDX_f3bbd0bc19bb6d8a887add0846; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_f3bbd0bc19bb6d8a887add0846" ON public.states USING btree (country_id);


--
-- Name: IDX_fd51374e987547873f53965540; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX "IDX_fd51374e987547873f53965540" ON public.service_requests USING btree (consumer_id);


--
-- Name: service_provider_localities FK_0e7314e9e91cbf8188807543d5c; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT "FK_0e7314e9e91cbf8188807543d5c" FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: bookings FK_12a0a22c64de5ca379662109301; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_12a0a22c64de5ca379662109301" FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id);


--
-- Name: districts FK_18b176b7f592f3a1c55d5e43a87; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.districts
    ADD CONSTRAINT "FK_18b176b7f592f3a1c55d5e43a87" FOREIGN KEY (state_id) REFERENCES public.states(id) ON DELETE CASCADE;


--
-- Name: bookings FK_26cb1abfe7ec7479360c8977f8c; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_26cb1abfe7ec7479360c8977f8c" FOREIGN KEY (consumer_id) REFERENCES public.users(id);


--
-- Name: services FK_298e6fc7011a043cf570557f4ee; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "FK_298e6fc7011a043cf570557f4ee" FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE CASCADE;


--
-- Name: service_requests FK_2c0b2ee39608f22fcd6a9dd9770; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT "FK_2c0b2ee39608f22fcd6a9dd9770" FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE RESTRICT;


--
-- Name: service_providers FK_2cc7c52b39288cadfad8a0ad63c; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT "FK_2cc7c52b39288cadfad8a0ad63c" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: localities FK_3d939c06ffb142e4bf8ac99bf6c; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.localities
    ADD CONSTRAINT "FK_3d939c06ffb142e4bf8ac99bf6c" FOREIGN KEY (district_id) REFERENCES public.districts(id) ON DELETE RESTRICT;


--
-- Name: service_requests FK_4608c7dc7c2a928d566741952ed; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT "FK_4608c7dc7c2a928d566741952ed" FOREIGN KEY (locality_id) REFERENCES public.localities(id) ON DELETE RESTRICT;


--
-- Name: services FK_70d400878cfc6cf1a8dcfcdcf66; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "FK_70d400878cfc6cf1a8dcfcdcf66" FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE RESTRICT;


--
-- Name: ratings_reviews FK_71d5183c11b7cd8588b9f04881a; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT "FK_71d5183c11b7cd8588b9f04881a" FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings_reviews FK_760ff71aa646ebac4904f5425a8; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT "FK_760ff71aa646ebac4904f5425a8" FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE CASCADE;


--
-- Name: service_provider_localities FK_af9e647dbb4d4bf3f99f72c20a0; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT "FK_af9e647dbb4d4bf3f99f72c20a0" FOREIGN KEY (locality_id) REFERENCES public.localities(id);


--
-- Name: service_types FK_c3f5113950eef9654b8fcb13f9e; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT "FK_c3f5113950eef9654b8fcb13f9e" FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- Name: bookings FK_df22e2beaabc33a432b4f65e3c2; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: service_requests FK_e0b22dfd82074364f7cf39de64d; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT "FK_e0b22dfd82074364f7cf39de64d" FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE RESTRICT;


--
-- Name: ratings_reviews FK_e8bef70d6ae75899c8de2bdf7ac; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT "FK_e8bef70d6ae75899c8de2bdf7ac" FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;


--
-- Name: states FK_f3bbd0bc19bb6d8a887add08461; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.states
    ADD CONSTRAINT "FK_f3bbd0bc19bb6d8a887add08461" FOREIGN KEY (country_id) REFERENCES public.countries(id) ON DELETE CASCADE;


--
-- Name: service_requests FK_fd51374e987547873f539655406; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT "FK_fd51374e987547873f539655406" FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

