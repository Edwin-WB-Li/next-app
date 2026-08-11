"use server";

import { saveQuizSet, deleteQuizSet } from "@/lib/quiz/data";
import { QuizSet } from "@/lib/quiz/types";

export async function importQuizSet(set: QuizSet) {
  await saveQuizSet(set);
}

export async function removeQuizSet(formData: FormData) {
  const id = formData.get("id") as string;
  if (id) {
    await deleteQuizSet(id);
  }
}
