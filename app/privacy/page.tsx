export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">개인정보 수집 및 이용 안내</h1>

        <p className="mt-4 text-sm leading-7 text-gray-700">
          TUSKA Flea는 Tokyo University of Science Korean Association 구성원을 위한
          중고거래·무료나눔 서비스입니다. 서비스 제공을 위해 필요한 최소한의
          개인정보만 수집 및 이용합니다.
        </p>

        <section className="mt-8 space-y-6 text-sm leading-7 text-gray-700">
          <div>
            <h2 className="text-base font-semibold text-black">1. 수집하는 정보</h2>
            <p className="mt-2">
              회원가입 및 서비스 이용 과정에서 아래 정보를 수집합니다.
            </p>
            <ul className="mt-2 list-disc pl-5">
              <li>이름</li>
              <li>이메일 주소</li>
              <li>카카오톡 ID</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">2. 이용 목적</h2>
            <ul className="mt-2 list-disc pl-5">
              <li>회원 식별 및 로그인 기능 제공</li>
              <li>게시글 작성자 확인</li>
              <li>이용자 간 거래 및 연락 수단 제공</li>
              <li>서비스 운영 및 기본적인 문의 대응</li>
            </ul>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">3. 보관 기간</h2>
            <p className="mt-2">
              수집한 개인정보는 회원 탈퇴 또는 서비스 이용 종료 시까지 보관하며,
              운영상 필요한 범위를 제외하고 지체 없이 삭제를 검토합니다.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">4. 제3자 제공</h2>
            <p className="mt-2">
              수집한 개인정보는 이용자 간 거래에 필요한 범위 내에서 서비스 화면에
              표시될 수 있으며, 그 외의 목적으로 제3자에게 판매하거나 제공하지
              않습니다.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">5. 표시되는 정보</h2>
            <p className="mt-2">
              서비스 이용 과정에서 작성자의 이름과 카카오톡 ID는 다른 로그인
              이용자에게 게시글 작성자 정보로 표시될 수 있습니다.
            </p>
          </div>

          <div>
            <h2 className="text-base font-semibold text-black">6. 문의</h2>
            <p className="mt-2">
              본 안내와 관련한 문의는 TUSKA Flea 운영자에게 전달해 주세요.
            </p>
          </div>
        </section>

        <p className="mt-8 text-xs text-gray-500">
          본 안내는 서비스 운영 상황에 따라 변경될 수 있습니다.
        </p>
      </div>
    </main>
  );
}