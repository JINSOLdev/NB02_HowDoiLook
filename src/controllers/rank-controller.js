import RankService from '../services/rank-service.js';

class RankController {
  constructor() {
    // RankService 인스턴스 생성해서 사용 (데이터 조회 책임 위임)
    this.rankService = new RankService(); 
  }

  // ✅ 랭킹 목록 조회 메서드
  async getRankingList(req, res, next) {
    try {
      // 사용자의 page, pageSize, rankBy 값을 쿼리 스트링에서 받아옴
      // validateRequest 미들웨어를 통해 유효성 검사를 이미 통과한 값임
      const { page = 1, pageSize = 10, rankBy = 'total' } = req.validated.query;

      const validRankBy = ['total', 'trendy', 'personality', 'practicality', 'costEffectiveness'];
      // 유효하지 않은 rankBy 값이 들어오면 400 오류 반환
      if (!validRankBy.includes(rankBy)) {
        return res.status(400).json({ message: `Invalid rankBy value: ${rankBy}` });
      }

      // ✅ 데이터 조회 및 평점 계산
      // offset은 페이징 처리 위한 시작 인덱스
      const offset = (page - 1) * pageSize;

      // 서비스에서 전체 스타일 불러옴
      const allStyles = await this.rankService.getRankingList();

      // 📍 평점 계산 로직
      const stylesWithRating = allStyles.map((style) => {
        let rating = 0;

        // 스타일마다 큐레이션 없으면 rating: null 반환
        if (style.curations.length === 0) return { ...style, rating: null };

        // 개별 항목 평점은 해당 항목만 평균, total은 4개 항목 합의 평균
        const sumReducer = (acc, cur, key) => acc + cur[key];
        if (['personality', 'practicality', 'costEffectiveness', 'trendy'].includes(rankBy)) {
          const sum = style.curations.reduce((acc, cur) => sumReducer(acc, cur, rankBy), 0);
          rating = sum / style.curations.length;
        } else {
          const sum = style.curations.reduce(
            (acc, cur) => acc + cur.trendy + cur.personality + cur.practicality + cur.costEffectiveness,
            0
          );
          rating = sum / (style.curations.length * 4);
        }

        // 소수점 첫째 자리로 반올림
        return { ...style, rating: Number(rating.toFixed(1)) };
      });

      // 평점을 기준으로 내림차순 정렬
      const sorted = stylesWithRating.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      // 요청한 페이지 범위만 잘라서 응답
      const paginated = sorted.slice(offset, offset + Number(pageSize));

      // 응답 데이터 구성
      const data = paginated.map((style, index) => {
        const topCategory = style.categories.find((cat) => cat.type === 'TOP');
        // 스타일마다 응답 형식 맞춰 구성
        // 썸네일, 닉네임, 태그, 카테고리, 순위, 평점 포함
        return {
          id: style.styleId,
          thumbnail: style.styleImages[0]?.image.imageUrl || null,
          nickname: style.nickname,
          title: style.title,
          tags: style.styleTags.map((tag) => tag.tag.name),
          categories: topCategory
            ? {
                top: {
                  name: topCategory.name,
                  brand: topCategory.brand,
                  price: Number(topCategory.price),
                },
              }
            : {},
          viewCount: style.viewCount,
          curationCount: style.curationCount,
          createdAt: style.createdAt,
          ranking: offset + index + 1,
          rating: style.rating,
        };
      });

      // 최종 응답 반환
      // 현재 페이지, 전체 페이지 수, 전체 항목 수, 데이터 리스트 응답
      res.status(200).json({
        currentPage: Number(page),
        totalPages: Math.ceil(allStyles.length / pageSize),
        totalItemCount: allStyles.length,
        data,
      });
    } catch (error) {
      // 에러 발생 시 next(error)로 에러 미들웨어에 전달
      next(error);
    }
  }
}

export default RankController;