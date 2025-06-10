// DB 접근을 위한 Prisma 클라이언트 불러옴
import db from '../config/db.js';

// 랭킹 관련 비즈니스 로직 담당하는 서비스 클래스 정의
class RankService {

  // 랭킹 리스트 조회하는 비동기 메서드 
  async getRankingList({ page, pageSize, rankBy }) {
    // 페이지네이션을 위한 오프셋 계산
    const offset = (page - 1) * pageSize;

    // 전체 스타일 불러오기
    // 모든 스타일 데이터 가져옴 -> 관련 이미지, 태그, 카테고리, 큐레이션 포함
    const allStyles = await db.style.findMany({
      include: {
        styleImages: {
          take: 1,
          include: { image: true },
        },
        styleTags: {
          include: { tag: true },
        },
        categories: true,
        curations: true,
      },
    });

    // 평균 점수 계산
    // 각 스타일바다 랭킹 점수 계산해서 새로운 배열 만듦
    const stylesWithRating = allStyles.map((style) => {
      let rating = 0;

      // 큐레이션이 없다면 랭킹 점수는 null
      if (style.curations.length === 0) {
        return { ...style, rating: null };
      }

      // rankBy 값에 따라 다른 기준으로 점수 계산산
      if (rankBy === 'personality') {
        const sum = style.curations.reduce((acc, cur) => acc + cur.personality, 0);
        rating = sum / style.curations.length;
      } else if (rankBy === 'practicality') {
        const sum = style.curations.reduce((acc, cur) => acc + cur.practicality, 0);
        rating = sum / style.curations.length;
      } else if (rankBy === 'costEffectiveness') {
        const sum = style.curations.reduce((acc, cur) => acc + cur.costEffectiveness, 0);
        rating = sum / style.curations.length;
      } else {
        // total (기본)
        const sum = style.curations.reduce(
          (acc, cur) => acc + cur.trendy + cur.personality + cur.practicality + cur.costEffectiveness,
          0
        );
        rating = sum / (style.curations.length * 4);
      }

      // 점수를 소수점 1자리로 반올림해서 새로운 필드로 포함
      return { ...style, rating: Number(rating.toFixed(1)) };
    });

    // 점수를 기준으로 내림차순 정렬
    const sortedStyles = stylesWithRating.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    // 오프셋과 페이지 사이즈에 해당하는 항목만 잘라내기
    const paginated = sortedStyles.slice(offset, offset + pageSize);

    // 최종적으로 클라이언트에게 보낼 데이터 구조 구성
    const data = paginated.map((style, index) => {
      // 카테고리 중에서 TOP 타입 인 것 찾아냄냄
      const topCategory = style.categories.find((cat) => cat.type === 'TOP');

      // 필요한 필드만 골라서 리턴
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

    // 페이지 정보와 데이터 배열을 포함한 최종 응답 객체를 반환
    return {
      currentPage: page,
      totalPages: Math.ceil(allStyles.length / pageSize),
      totalItemCount: allStyles.length,
      data,
    };
  }
}

// 서비스 클래스 외부에서 사용할 수 있게 export
export default RankService;
