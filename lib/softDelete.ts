/**
 * DL STUDIO 누적 관리 유틸
 * - 삭제 없음: isActive: false 처리
 * - 덮어쓰기 없음: updatedAt + prevSnapshot 기록
 * - ID 고유값 보장: nanoid 대신 타임스탬프 + 카테고리 prefix
 */

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function nowTs(): string {
  return new Date().toISOString();
}

/** soft delete: isActive false + deletedAt 기록 */
export function softDelete<T extends { id: string; isActive: boolean; deletedAt?: string }>(
  list: T[],
  id: string
): T[] {
  return list.map((item) =>
    item.id === id
      ? { ...item, isActive: false, deletedAt: nowTs() }
      : item
  );
}

/** soft update: updatedAt 갱신 + prevSnapshot 보관 */
export function softUpdate<T extends { id: string; updatedAt: string; prevSnapshot?: string }>(
  list: T[],
  id: string,
  changes: Partial<T>
): T[] {
  return list.map((item) => {
    if (item.id !== id) return item;
    return {
      ...item,
      ...changes,
      updatedAt: nowTs(),
      prevSnapshot: JSON.stringify(item), // 수정 전 원본 보존
    };
  });
}

/** 활성 항목만 반환 */
export function activeOnly<T extends { isActive: boolean }>(list: T[]): T[] {
  return list.filter((item) => item.isActive);
}

/** 고유 ID 생성 */
export function genId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
