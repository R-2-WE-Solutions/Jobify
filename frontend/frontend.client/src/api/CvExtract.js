import { rawRequest } from "./profile";

export async function extractSkillsFromCv(file) {
    const form = new FormData();
    form.append("file", file); 

    const res = await rawRequest("/student/cv/upload", {
        method: "POST",
        body: form,
    });

    return res.json();
}
