"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function Home() {
  const [session, setSession] = useState<any>(null)
  const [bookmarks, setBookmarks] = useState<any[]>([])
  const [url, setUrl] = useState("")
  const [title, setTitle] = useState("")
  const [errors, setErrors] = useState<{ title?: string; url?: string }>({})


  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) fetchBookmarks()
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        if (session) fetchBookmarks()
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [])


  useEffect(() => {
    if (!session) return

    const channel = supabase
      .channel("bookmarks-channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookmarks" },
        () => fetchBookmarks()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session])


  const fetchBookmarks = async () => {
    const { data } = await supabase
      .from("bookmarks")
      .select("*")
      .order("created_at", { ascending: false })

    setBookmarks(data || [])
  }


  const addBookmark = async () => {
    const newErrors: { title?: string; url?: string } = {}

    if (!title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!url.trim()) {
      newErrors.url = "URL is required"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})

    await supabase.from("bookmarks").insert({
      url,
      title,
      user_id: session.user.id,
    })

    setTitle("")
    setUrl("")
    fetchBookmarks()
  }


  const deleteBookmark = async (id: string) => {
    await supabase.from("bookmarks").delete().eq("id", id)
    fetchBookmarks()
  }


  if (!session)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="bg-white border border-gray-300 rounded-2xl shadow-lg p-10 w-80 text-center">
          <h1 className="text-2xl font-semibold mb-2 text-gray-800">
            Welcome Back
          </h1>
          <p className="text-sm font-medium mb-6 text-gray-500">
            To Bookmark Application
          </p>

          <button
            onClick={() =>
              supabase.auth.signInWithOAuth({ provider: "google" })
            }
            className="w-full border border-blue-500 text-blue-600 font-medium py-3 rounded-lg 
                       hover:bg-blue-500 hover:text-white transition-all duration-300 cursor-pointer"
          >
            Login with Google
          </button>
        </div>
      </div>
    )


  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="max-w-xl mx-auto bg-white shadow-xl rounded-2xl p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Smart Bookmark App
          </h1>

          <button
            onClick={() => supabase.auth.signOut()}
            className="border border-red-500 text-red-500 px-4 py-2 rounded-lg
                       hover:bg-red-500 hover:text-white transition duration-300 cursor-pointer"
          >
            Logout
          </button>
        </div>

        {/* Add Bookmark */}
        <div className="mb-8 space-y-4">

          {/* Title */}
          <div>
            <input
              placeholder="Enter Title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                setErrors((prev) => ({ ...prev, title: undefined }))
              }}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2
                ${errors.title
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* URL */}
          <div>
            <input
              placeholder="Enter URL"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setErrors((prev) => ({ ...prev, url: undefined }))
              }}
              className={`w-full border p-3 rounded-lg focus:outline-none focus:ring-2
                ${errors.url
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 focus:ring-blue-400"
                }`}
            />
            {errors.url && (
              <p className="text-red-500 text-sm mt-1">{errors.url}</p>
            )}
          </div>

          <button
            onClick={addBookmark}
            className="w-full bg-green-500 text-white font-medium py-3 rounded-lg 
                       hover:bg-green-600 transition duration-300 shadow cursor-pointer"
          >
            Add Bookmark
          </button>
        </div>

        {/* Bookmark List */}
        <div className="space-y-4">
          {bookmarks.length === 0 && (
            <p className="text-center text-gray-500">
              No bookmarks added yet.
            </p>
          )}

          {bookmarks.map((b) => (
            <div
              key={b.id}
              className="flex justify-between items-center bg-gray-50 
                         border border-gray-200 p-4 rounded-xl 
                         hover:shadow-md transition duration-300"
            >
              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 font-medium hover:underline truncate"
              >
                {b.title}
              </a>

              <button
                onClick={() => deleteBookmark(b.id)}
                className="text-sm border border-red-400 text-red-500 
                           px-3 py-1 rounded-lg hover:bg-red-500 
                           hover:text-white transition duration-300 cursor-pointer"
              >
                Delete
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
