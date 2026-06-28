'use client';

import { useRef } from 'react';
import { UploadCloud, Film, Image as ImageIcon, X } from 'lucide-react';

interface Props {
  mediaUrls: string[];
  onChange: (urls: string[]) => void;
}

/**
 * 미디어 업로더 (mock)
 * - 현재는 실제 서버 업로드 없이 파일명을 mock URL로 저장한다.
 * - 추후 Supabase Storage / S3 연동 시 handleFiles 내부의 업로드 로직만 교체하면 된다.
 */
export default function PrescriptionMediaUploader({ mediaUrls, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    // TODO: 실제 업로드 연동 시 여기서 Storage 업로드 후 반환 URL을 사용
    const added = Array.from(files).map((f) => `mock://${f.name}`);
    onChange([...mediaUrls, ...added]);
    if (inputRef.current) inputRef.current.value = '';
  }

  function remove(idx: number) {
    onChange(mediaUrls.filter((_, i) => i !== idx));
  }

  const isVideo = (url: string) => /\.(mp4|mov|avi|webm)$/i.test(url);

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-[#BDD9EA] bg-[#F4F8FB] hover:bg-[#EAF4FA] transition-colors"
      >
        <UploadCloud size={22} className="text-[#2F80A7]" />
        <span className="text-sm font-medium text-[#2F80A7]">스윙 영상 / 사진 업로드</span>
        <span className="text-xs text-[#9CA3AF]">클릭하여 파일 선택 (현재는 mock 저장)</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="video/*,image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {mediaUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mediaUrls.map((url, i) => (
            <div key={`${url}-${i}`} className="flex items-center gap-1.5 bg-white border border-[#E5E7EB] rounded-lg px-2.5 py-1.5">
              {isVideo(url) ? <Film size={13} className="text-[#2F80A7]" /> : <ImageIcon size={13} className="text-[#2F8F5B]" />}
              <span className="text-xs text-[#374151] max-w-40 truncate">{url.replace('mock://', '')}</span>
              <button type="button" onClick={() => remove(i)} className="p-0.5 rounded hover:bg-[#F3F4F6] text-[#9CA3AF]">
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
