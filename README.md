# DL Studio

필라테스/스튜디오 운영을 위한 관리 시스템입니다. 고객·예약·수강권·운동 처방·매출·재무를 한 곳에서 관리합니다.

## 주요 기능

| 영역 | 설명 |
|------|------|
| 📊 대시보드 | 오늘 예약, 최근 고객/거래, 예약 현황 요약 |
| 👤 고객 관리 | 고객 등록·검색·상세, 수강권 카드 |
| 📅 예약 관리 | 주간 캘린더, 예약 테이블·필터, 상세 모달 |
| 🎫 수강권 | 수강권 발급·사용 내역, 요약 카드 |
| 🏋️ 운동 처방 | 처방 작성, 미디어 업로드, 점수·피드백 카드 |
| 💳 매출 | 매출 등록, 차트, 필터, 요약 카드 |
| 💰 재무 | 입금/출금 거래 관리(수입·지출 분류), 영수증·세금계산서 |
| ⚙️ 설정 | 카테고리·옵션·코치 관리 |

## 기술 스택

- **프레임워크**: [Next.js 16](https://nextjs.org) (App Router), React 19
- **언어**: TypeScript
- **스타일**: Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), Base UI
- **차트**: Recharts
- **아이콘**: lucide-react
- **PWA**: next-pwa
- **데이터**: 현재 `data/`의 목(mock) 데이터 기반 + React Context 상태 관리

## 시작하기

의존성 설치 후 개발 서버를 실행합니다.

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속합니다.

> 개발 서버는 `-H 0.0.0.0` 으로 실행되어 같은 네트워크의 다른 기기(모바일 등)에서도 `http://<PC-IP>:3000` 으로 접속할 수 있습니다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 실행 (0.0.0.0 바인딩) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 검사 |

## 프로젝트 구조

```
app/            # 라우트별 페이지 (customers, reservations, passes,
                #   sales, finance, settings, martin-prescription)
components/     # 도메인별 UI 컴포넌트 + 공용 ui/ (shadcn)
context/        # 도메인별 React Context (상태 관리)
data/           # 목(mock) 데이터
types/          # 도메인 타입 정의
lib/, utils/    # 공용 유틸 (색상, soft delete, 날짜, 분석 등)
public/         # 정적 자원, PWA 매니페스트/아이콘
```

## 라이선스

비공개 프로젝트입니다 (`private`).
