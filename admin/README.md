# 인천 아일랜드 투어 관리자 대시보드 MVP

## 접속 경로
GitHub Pages 배포 후:

`https://<사용자아이디>.github.io/incheon-island-tour/admin/`

## 현재 가능한 기능
- 대시보드 요약
- 투어상품 추가/수정/삭제
- 문의 상태 관리
- 후기 추가/수정/삭제
- FAQ 추가/수정/삭제
- 연락처/CTA 설정
- JSON 백업/복원
- 반응형 관리자 UI

## 매우 중요
이 버전은 GitHub Pages용 **정적 관리자 UI 데모**입니다.

- 실제 로그인/권한 제어가 없습니다.
- 데이터는 브라우저 localStorage에만 저장됩니다.
- 다른 PC/브라우저와 데이터가 공유되지 않습니다.
- 관리자가 수정해도 공개 홈페이지 HTML에는 자동 반영되지 않습니다.
- 실제 문의폼의 데이터도 자동 수집되지 않습니다.

## 실제 운영 버전으로 만들려면
추천 조합:
1. Supabase Auth — 관리자 로그인
2. Supabase Database — 투어/문의/후기/FAQ 데이터
3. Supabase Storage — 투어 및 후기 사진
4. 기존 정적 홈페이지에서 Supabase 데이터를 읽어 화면에 출력

또는 Firebase / 별도 Node.js 백엔드로도 구현할 수 있습니다.

## 보안
실제 개인정보가 포함된 고객 문의를 localStorage 기반 MVP에 저장하지 마세요.
