"use server";

import fs from "fs/promises";
import path from "path";
import { revalidatePath } from "next/cache";

export interface Post {
  id: string;
  title: string;
  slug: string;
  summary: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const POSTS_DIR = path.join(DATA_DIR, "posts");

async function ensureDirs() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(POSTS_DIR, { recursive: true });
}

async function readPostsMeta(): Promise<Post[]> {
  try {
    const raw = await fs.readFile(POSTS_FILE, "utf-8");
    return JSON.parse(raw) as Post[];
  } catch {
    return [];
  }
}

async function writePostsMeta(posts: Post[]) {
  await ensureDirs();
  await fs.writeFile(POSTS_FILE, JSON.stringify(posts, null, 2), "utf-8");
}

function getPostFilePath(id: string) {
  return path.join(POSTS_DIR, `${id}.md`);
}

export async function getAllPosts(): Promise<Post[]> {
  return readPostsMeta();
}

export async function getPublishedPosts(): Promise<Post[]> {
  const posts = await readPostsMeta();
  return posts.filter((p) => p.published);
}

export async function getPostById(
  id: string
): Promise<{ post: Post | null; content: string }> {
  const posts = await readPostsMeta();
  const post = posts.find((p) => p.id === id) ?? null;
  if (!post) return { post: null, content: "" };

  try {
    const content = await fs.readFile(getPostFilePath(id), "utf-8");
    return { post, content };
  } catch {
    return { post, content: "" };
  }
}

export async function getPostBySlug(
  slug: string
): Promise<{ post: Post | null; content: string }> {
  const posts = await readPostsMeta();
  const post = posts.find((p) => p.slug === slug) ?? null;
  if (!post) return { post: null, content: "" };

  try {
    const content = await fs.readFile(getPostFilePath(post.id), "utf-8");
    return { post, content };
  } catch {
    return { post, content: "" };
  }
}

export async function createPost(data: {
  title: string;
  slug: string;
  summary: string;
  content: string;
  published?: boolean;
}) {
  const posts = await readPostsMeta();

  if (posts.some((p) => p.slug === data.slug)) {
    throw new Error("Slug 已存在");
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const newPost: Post = {
    id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    published: data.published ?? false,
    createdAt: now,
    updatedAt: now,
  };

  posts.unshift(newPost);
  await writePostsMeta(posts);
  await fs.writeFile(getPostFilePath(id), data.content, "utf-8");

  revalidatePath("/");
  revalidatePath("/admin");
  return newPost;
}

export async function updatePost(
  id: string,
  data: {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    published?: boolean;
  }
) {
  const posts = await readPostsMeta();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("文章不存在");

  if (data.slug && data.slug !== posts[index].slug) {
    if (posts.some((p) => p.id !== id && p.slug === data.slug)) {
      throw new Error("Slug 已存在");
    }
  }

  const now = new Date().toISOString();
  posts[index] = {
    ...posts[index],
    ...(data.title !== undefined && { title: data.title }),
    ...(data.slug !== undefined && { slug: data.slug }),
    ...(data.summary !== undefined && { summary: data.summary }),
    ...(data.published !== undefined && { published: data.published }),
    updatedAt: now,
  };

  await writePostsMeta(posts);

  if (data.content !== undefined) {
    await fs.writeFile(getPostFilePath(id), data.content, "utf-8");
  }

  revalidatePath("/");
  revalidatePath(`/posts/${posts[index].slug}`);
  revalidatePath("/admin");
  revalidatePath(`/admin/edit/${id}`);
  return posts[index];
}

export async function deletePost(id: string) {
  const posts = await readPostsMeta();
  const filtered = posts.filter((p) => p.id !== id);
  if (filtered.length === posts.length) throw new Error("文章不存在");

  await writePostsMeta(filtered);
  try {
    await fs.unlink(getPostFilePath(id));
  } catch {
    // ignore
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

export async function togglePublish(id: string) {
  const posts = await readPostsMeta();
  const index = posts.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("文章不存在");

  posts[index].published = !posts[index].published;
  posts[index].updatedAt = new Date().toISOString();
  await writePostsMeta(posts);

  revalidatePath("/");
  revalidatePath("/admin");
  return posts[index];
}
