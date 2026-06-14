import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  index,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ── Enums ─────────────────────────────────────────────────────────────────────

export const holeStatusEnum = pgEnum('hole_status', ['draft', 'published']);
export const proStatusEnum = pgEnum('pro_status', ['inactive', 'active', 'past_due', 'cancelled']);
export const issueStatusEnum = pgEnum('issue_status', ['compiling', 'sent_to_print', 'shipped']);

// ── Users ─────────────────────────────────────────────────────────────────────

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  cognitoSub: text('cognito_sub').notNull().unique(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  bio: text('bio'),
  avatarUrl: text('avatar_url'),
  proStatus: proStatusEnum('pro_status').notNull().default('inactive'),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Rabbit Holes ──────────────────────────────────────────────────────────────

export const rabbitHoles = pgTable(
  'rabbit_holes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').unique(),
    spark: text('spark'),
    body: text('body').notNull().default(''),
    tags: text('tags').array().notNull().default([]),
    featured: boolean('featured').notNull().default(false),
    readTimeMins: integer('read_time_mins').notNull().default(1),
    status: holeStatusEnum('status').notNull().default('draft'),
    upvoteCount: integer('upvote_count').notNull().default(0),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('rabbit_holes_author_id_idx').on(t.authorId),
    index('rabbit_holes_status_published_at_idx').on(t.status, t.publishedAt),
  ],
);

// ── Upvotes ───────────────────────────────────────────────────────────────────

export const upvotes = pgTable(
  'upvotes',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    holeId: uuid('hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.userId, t.holeId] }),
    index('upvotes_hole_id_idx').on(t.holeId),
  ],
);

// ── Follows ───────────────────────────────────────────────────────────────────

export const follows = pgTable(
  'follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followingId: uuid('following_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.followerId, t.followingId] }),
    index('follows_following_id_idx').on(t.followingId),
    check('no_self_follow', sql`${t.followerId} != ${t.followingId}`),
  ],
);

// ── Book Issues ───────────────────────────────────────────────────────────────

export const bookIssues = pgTable('book_issues', {
  id: uuid('id').primaryKey().defaultRandom(),
  issueNumber: integer('issue_number').notNull().unique(),
  season: text('season').notNull(),
  status: issueStatusEnum('status').notNull().default('compiling'),
  cutoffDate: date('cutoff_date').notNull(),
  shippedAt: timestamp('shipped_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ── Book Issue Holes (join table) ─────────────────────────────────────────────

export const bookIssueHoles = pgTable(
  'book_issue_holes',
  {
    issueId: uuid('issue_id')
      .notNull()
      .references(() => bookIssues.id, { onDelete: 'cascade' }),
    holeId: uuid('hole_id')
      .notNull()
      .references(() => rabbitHoles.id, { onDelete: 'cascade' }),
    rank: integer('rank').notNull(),
    upvoteSnapshot: integer('upvote_snapshot').notNull(),
  },
  (t) => [primaryKey({ columns: [t.issueId, t.holeId] })],
);