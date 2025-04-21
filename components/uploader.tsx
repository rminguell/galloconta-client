'use client'

import { useState, type FormEvent } from 'react'
import { useTranslations } from 'next-intl'
import { uploadPredict } from '@/lib/upload'
import ZoomableImage from '@/components/zoomable-image'
import FeedbackForm from '@/components/feedback-form'
import AdjustParams from '@/components/adjust-params'

export default function Uploader() {
  const t = useTranslations('upload')
  const max_size = parseFloat(process.env.NEXT_PUBLIC_MAX_UPLOAD_MB ?? '')
  const [preview, setPreview] = useState<string | null>(null)
  const [imageName, setImageName] = useState<string>('')
  const [file, setFile] = useState<File | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [resultCount, setResultCount] = useState<number | null>(null)
  const [showSliders, setShowSliders] = useState(false)
  const [param1, setParam1] = useState(0.83)
  const [param2, setParam2] = useState(0.70)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  function reset() {
    setIsUploading(false)
    setResultCount(null)
    setShowSliders(false)
    setResultCount(null)
    setFeedbackOpen(false)
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
      setPreview(null)
  }

  function handleFileChange(file: File) {
    if (file.type.split('/')[0] !== 'image') {
      alert(t('format_error'))
      return
    }

    if (file.size / 1024 / 1024 > max_size && max_size > 0) {
      alert(`${t('size_error')} ${max_size} MB`)
      return
    }

    setFile(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!file) return

    setIsUploading(true)

    try {
      const result = await uploadPredict(file, param1, param2)
      if (result) {
        setImageName(result?.result_image?.split("/").pop() ?? "")
        setPreview(process.env.NEXT_PUBLIC_BACKEND_URL + result.result_image.slice(1))
        setResultCount(result.object_count)
        setShowSliders(true)
      }
    } catch (err) {
      alert(t('prediction_error'))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <>
      {feedbackOpen && file &&(
        <FeedbackForm 
        closeForm = {reset}
        filename = {imageName}
        param_1 = {param1}
        param_2 = {param2}
        />
      )}

      <form className="grid gap-6" onSubmit={handleSubmit}>
        <div>
          <div className="space-y-1 mb-4">
            <h2 className="text-xl font-semibold text-center">{t('start')}</h2>
          </div>
          <label
            hidden={!isUploading && resultCount!=null}
            htmlFor="image-upload"
            className="group relative mt-2 aspect-[3/2] cursor-pointer flex flex-col items-center justify-center rounded-md border border-gray-300 bg-white shadow-sm transition-all hover:bg-gray-50"
          >
            {!file && (<div
              className="absolute z-[5] h-full w-full rounded-md"
              onDragOver={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(true)
              }}
              onDragEnter={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(false)
              }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setDragActive(false)
                const file = e.dataTransfer?.files?.[0]
                if (file) handleFileChange(file)
              }}
            />)}
            {!file && (<div
              className={`${
                dragActive ? 'border-2 border-black' : ''
              } absolute z-[3] flex h-full w-full flex-col items-center justify-center rounded-md px-10 transition-all ${
                preview
                  ? 'bg-white/80 opacity-0 hover:opacity-100 hover:backdrop-blur-md'
                  : 'bg-white opacity-100 hover:bg-gray-50'
              }`}
            >
              <svg
                className={`${
                  dragActive ? 'scale-110' : 'scale-100'
                } h-7 w-7 text-gray-500 transition-all duration-75 group-hover:scale-110 group-active:scale-95`}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <title>Upload icon</title>
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
              <p className="mt-2 text-center text-sm text-gray-500">
                {t('drag')}
              </p>
              <p className="mt-2 text-center text-sm text-gray-500">
                {t('limit')}: {max_size} MB
              </p>
              <span className="sr-only">Photo upload</span>
            </div>)}

            {preview && file && (
              <div className="relative w-full aspect-[3/2] rounded-md overflow-hidden">
                <ZoomableImage 
                  src={preview} 
                  alt="Preview"
                  className="absolute inset-0 w-full h-full"
                />
                {isUploading && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-50">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/20 border-t-black" />
                  </div>
                )}
                {resultCount !== null && !feedbackOpen && (
                  <div className="absolute bottom-2 left-2 flex space-x-2 z-50">
                    <button 
                      onClick={async () => {
                        try {
                          const response = await fetch(preview);
                          const blob = await response.blob();
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `${resultCount}_${imageName}`;
                          link.click();
                          URL.revokeObjectURL(url);
                        } catch (error) {
                          console.error("download error", error);
                        }
                      }}
                      className="flex items-center space-x-2 px-3 py-2 bg-white rounded-full shadow-md"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 10l5 5 5-5M12 4v12" />
                      </svg>
                      <span className="text-black text-sm">{t('download')}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              disabled={file != null}
              id="image-upload"
              name="image"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => {
                const file = event.currentTarget?.files?.[0]
                if (file) handleFileChange(file)
              }}  
            />
          </div>
        </div>

        {!resultCount && (
          <button
            type="submit"
            disabled={isUploading || !file}
            className="text-sm font-medium border-black bg-black text-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
          >
            {t('predict')}
          </button>
        )}

        {resultCount !== null && (
          <div className="text-center text-3xl font-bold">{resultCount} {t('cranes')}</div>
        )}

        {showSliders && (
          <AdjustParams
            show={showSliders}
            param1={param1}
            setParam1={setParam1}
            param2={param2}
            setParam2={setParam2}
            onSubmit={() => {
              if (file) handleSubmit({ preventDefault: () => {} } as FormEvent<HTMLFormElement>)
            }}
          />
        )}

        <button
          type="reset"
          onClick={function () {resultCount !== null ? setFeedbackOpen(true) : reset()} }
          disabled={isUploading || !file}
          className="text-sm font-medium border-gray-200 bg-gray-100 text-gray-700 hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400 flex h-10 w-full items-center justify-center rounded-md border text-sm transition-all focus:outline-none"
        >
          {t('reset')}
        </button>
      </form>
    </>
  )
}
