// 비즈니스 로직을 담당하는 서비스 클래스를 가져온다.
// 🫠 컨트롤러에서 서비스 클래스 가져오는 이유는?
import RankService from '../services/rank-service.js';

// 컨트롤러 클래스 정의
class RankController {
  // 서비스 인스턴스를 생성해 컨트롤러에서 사용할 수 있도록 한다.
  // 🫠 서비스 인스턴스를 컨트롤러에서 생성하는 이유는?
  constructor() {
    this.rankService = new RankService();
  }
  // 랭킹 리스트를 조회하는 요청을 처리하는 비동기 메서드
  async getRankingList(req, res, next) {
    try {
      // 쿼리 파라미터에서 페이지, 페이지크기, 랭킹 기준을 추출하고 기본값을 설정
      const { page = 1, pageSize = 10, rankBy = 'total' } = req.query;

      // 허용된 랭킹 값을 미리 정의한다.
      const validRankBy = ['total', 'trendy', 'personality', 'practicality', 'costEffectiveness'];
      // 유효하지 않은 rankBy 값이 들어오면 400 오류 반환
      if (!validRankBy.includes(rankBy)) {
        return res.status(400).json({ message: `Invalid rankBy value: ${rankBy}` });
      }

      // service layer에 실제 랭킹 리스트를 요청 -> page, pageSize는 숫자로 반환
      const result = await this.rankService.getRankingList({
        page: Number(page),
        pageSize: Number(pageSize),
        rankBy,
      });

      // 결과는는 200 상태 코드와 함께 JSON으로 응답
      res.status(200).json(result);
    } catch (error) {
      // 에러 발생하면 express 에러 핸들링 미들웨어로 넘겨겨
      next(error);
    }
  }
}

// 컨트롤러 클래스 외부에서 사용할 수 있게 export
export default RankController;