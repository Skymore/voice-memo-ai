import { REGISTER_API, LOGIN_API, UPLOAD_API } from "../lib/apiConstants"
import { BASE_URL } from "../lib/apiConstants"

interface RegisterResponse {
  status: number
  message: string
}

interface LoginResponse {
  status: number
  message: string
  access_token: string
  token_type: string
}

interface UploadResponse {
  job_id?: string
  status: number | string
  message: string
}

interface Prompt {
  [key: string]: string
}

interface Subcategory {
  subcategory_name: string
  subcategory_id: string
  prompts: Prompt
}

interface Category {
  category_name: string
  category_id: string
  subcategories: Subcategory[]
}

interface PromptsResponse {
  status: number
  data: Category[]
}

export async function registerUser(email: string, password: string): Promise<RegisterResponse> {
  const response = await fetch(REGISTER_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch(LOGIN_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  const data: LoginResponse = await response.json()

  if (!response.ok) {
    return {
      status: response.status,
      message: data.message || "An error occurred during login",
      access_token: "",
      token_type: "",
    }
  }

  return data
}

export async function uploadFile(
  file: File,
  prompt_category_id: string,
  prompt_subcategory_id: string,
  token: string,
): Promise<UploadResponse> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("prompt_category_id", prompt_category_id)
  formData.append("prompt_subcategory_id", prompt_subcategory_id)

  const response = await fetch(UPLOAD_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const data: UploadResponse = await response.json()

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`)
  }

  return data
}

export async function fetchPrompts(): Promise<PromptsResponse> {
  const response = await fetch(`${BASE_URL}/retrieve_prompts`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }

  return await response.json()
}
