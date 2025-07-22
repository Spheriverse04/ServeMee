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
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


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
    consumer_id uuid NOT NULL,
    service_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    notes text
);


ALTER TABLE public.bookings OWNER TO servemee_user;

--
-- Name: localities; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.localities (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(255) NOT NULL,
    polygon_geometry public.geometry(Polygon,4326) NOT NULL,
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
-- Name: provider_services; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.provider_services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    service_provider_id uuid NOT NULL,
    service_type_id uuid NOT NULL,
    base_fare numeric(10,2) NOT NULL,
    is_available boolean DEFAULT true NOT NULL,
    additional_attributes jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.provider_services OWNER TO servemee_user;

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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ratings_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
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
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_categories OWNER TO servemee_user;

--
-- Name: service_provider_localities; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_provider_localities (
    service_provider_id uuid NOT NULL,
    locality_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_provider_localities OWNER TO servemee_user;

--
-- Name: service_providers; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_providers (
    user_id uuid NOT NULL,
    description text,
    passport_photo_url text,
    is_verified boolean DEFAULT false NOT NULL,
    average_rating numeric(2,1) DEFAULT 0.0 NOT NULL,
    total_ratings integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_providers OWNER TO servemee_user;

--
-- Name: service_requests; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.service_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    consumer_id uuid NOT NULL,
    service_provider_id uuid,
    service_type_id uuid NOT NULL,
    requested_at_location public.geometry(Point,4326) NOT NULL,
    service_address text NOT NULL,
    status character varying(50) NOT NULL,
    otp_code character varying(6),
    total_cost numeric(10,2),
    payment_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    payment_method character varying(50),
    request_details jsonb,
    requested_at timestamp with time zone DEFAULT now() NOT NULL,
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
    base_fare_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.service_types OWNER TO servemee_user;

--
-- Name: services; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.services (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    price numeric(10,2) NOT NULL,
    category character varying(50),
    "isActive" boolean DEFAULT true NOT NULL,
    "providerId" uuid NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.services OWNER TO servemee_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: servemee_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    firebase_uid character varying(128) NOT NULL,
    email character varying(255),
    phone_number character varying(20),
    username character varying(50),
    profile_picture_url text,
    full_name character varying(255) NOT NULL,
    role character varying(50) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "displayName" character varying(100)
);


ALTER TABLE public.users OWNER TO servemee_user;

--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: migrations PK_8c82d7f526340ab734260ea46be; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY (id);


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
-- Name: localities localities_name_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.localities
    ADD CONSTRAINT localities_name_key UNIQUE (name);


--
-- Name: localities localities_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.localities
    ADD CONSTRAINT localities_pkey PRIMARY KEY (id);


--
-- Name: provider_services provider_services_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_pkey PRIMARY KEY (id);


--
-- Name: provider_services provider_services_service_provider_id_service_type_id_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_provider_id_service_type_id_key UNIQUE (service_provider_id, service_type_id);


--
-- Name: ratings_reviews ratings_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT ratings_reviews_pkey PRIMARY KEY (id);


--
-- Name: ratings_reviews ratings_reviews_service_request_id_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT ratings_reviews_service_request_id_key UNIQUE (service_request_id);


--
-- Name: service_categories service_categories_name_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_name_key UNIQUE (name);


--
-- Name: service_categories service_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_categories
    ADD CONSTRAINT service_categories_pkey PRIMARY KEY (id);


--
-- Name: service_provider_localities service_provider_localities_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT service_provider_localities_pkey PRIMARY KEY (service_provider_id, locality_id);


--
-- Name: service_providers service_providers_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_pkey PRIMARY KEY (user_id);


--
-- Name: service_requests service_requests_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_pkey PRIMARY KEY (id);


--
-- Name: service_types service_types_category_id_name_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_category_id_name_key UNIQUE (category_id, name);


--
-- Name: service_types service_types_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_firebase_uid_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_firebase_uid_key UNIQUE (firebase_uid);


--
-- Name: users users_phone_number_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_number_key UNIQUE (phone_number);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_localities_geometry; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_localities_geometry ON public.localities USING gist (polygon_geometry);


--
-- Name: idx_ratings_reviews_provider_id; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_ratings_reviews_provider_id ON public.ratings_reviews USING btree (service_provider_id);


--
-- Name: idx_service_requests_consumer_id; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_service_requests_consumer_id ON public.service_requests USING btree (consumer_id);


--
-- Name: idx_service_requests_location; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_service_requests_location ON public.service_requests USING gist (requested_at_location);


--
-- Name: idx_service_requests_service_provider_id; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_service_requests_service_provider_id ON public.service_requests USING btree (service_provider_id);


--
-- Name: idx_service_requests_status; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_service_requests_status ON public.service_requests USING btree (status);


--
-- Name: idx_users_firebase_uid; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_users_firebase_uid ON public.users USING btree (firebase_uid);


--
-- Name: idx_users_phone_number; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_users_phone_number ON public.users USING btree (phone_number);


--
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: servemee_user
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- Name: bookings FK_26cb1abfe7ec7479360c8977f8c; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_26cb1abfe7ec7479360c8977f8c" FOREIGN KEY (consumer_id) REFERENCES public.users(id);


--
-- Name: services FK_8b619ef0a4fe392dbde07eee1e2; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.services
    ADD CONSTRAINT "FK_8b619ef0a4fe392dbde07eee1e2" FOREIGN KEY ("providerId") REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: bookings FK_df22e2beaabc33a432b4f65e3c2; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT "FK_df22e2beaabc33a432b4f65e3c2" FOREIGN KEY (service_id) REFERENCES public.services(id);


--
-- Name: provider_services provider_services_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE CASCADE;


--
-- Name: provider_services provider_services_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.provider_services
    ADD CONSTRAINT provider_services_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE CASCADE;


--
-- Name: ratings_reviews ratings_reviews_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT ratings_reviews_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: ratings_reviews ratings_reviews_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT ratings_reviews_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE CASCADE;


--
-- Name: ratings_reviews ratings_reviews_service_request_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.ratings_reviews
    ADD CONSTRAINT ratings_reviews_service_request_id_fkey FOREIGN KEY (service_request_id) REFERENCES public.service_requests(id) ON DELETE CASCADE;


--
-- Name: service_provider_localities service_provider_localities_locality_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT service_provider_localities_locality_id_fkey FOREIGN KEY (locality_id) REFERENCES public.localities(id) ON DELETE CASCADE;


--
-- Name: service_provider_localities service_provider_localities_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_provider_localities
    ADD CONSTRAINT service_provider_localities_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE CASCADE;


--
-- Name: service_providers service_providers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_providers
    ADD CONSTRAINT service_providers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_requests service_requests_consumer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_consumer_id_fkey FOREIGN KEY (consumer_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: service_requests service_requests_service_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_service_provider_id_fkey FOREIGN KEY (service_provider_id) REFERENCES public.service_providers(user_id) ON DELETE SET NULL;


--
-- Name: service_requests service_requests_service_type_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_requests
    ADD CONSTRAINT service_requests_service_type_id_fkey FOREIGN KEY (service_type_id) REFERENCES public.service_types(id) ON DELETE RESTRICT;


--
-- Name: service_types service_types_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: servemee_user
--

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

