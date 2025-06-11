import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 태그 name 배열을 받아 findOrCreate 후 [{ tagId }] 배열 반환
async function getOrCreateTagIds(tagNames = []) {
  const tagObjs = [];
  for (let name of tagNames) {
    const cleanName = name.trim();
    let tag = await prisma.tag.findUnique({ where: { name: cleanName } });
    if (!tag) {
      tag = await prisma.tag.create({ data: { name: cleanName } });
    }
    tagObjs.push({ tagId: tag.tagId });
  }
  return tagObjs;
}

// 이미지 url 배열을 받아 Image 테이블에 저장 후 [{ imageId }] 배열 반환
async function createImagesAndReturnIds(images = []) {
  const imageObjs = [];
  for (let img of images || []) {
    const newImage = await prisma.image.create({
      data: { imageUrl: img.url },
    });
    imageObjs.push({ imageId: newImage.imageId });
  }
  return imageObjs;
}

// BigInt JSON 직렬화 변환
function jsonBigIntReplacer(key, value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

// categories 배열 → 객체 변환 (응답용)
function categoriesArrayToObject(categoriesArr) {
  const obj = {};
  for (const cat of categoriesArr) {
    obj[cat.type.toLowerCase()] = {
      name: cat.name,
      brand: cat.brand,
      price: cat.price.toString(),
    };
  }
  return obj;
}

export class StyleController {
  // 스타일 등록
  static async createStyle(req, res, next) {
    try {
      const { nickname, title, content, password, categories, tags = [], images = [] } = req.body;

      // categories: 객체 또는 배열 → 배열로 변환 (Prisma 저장용)
      let categoriesArr = [];
      if (categories && Array.isArray(categories)) {
        categoriesArr = categories.map((cat) => ({
          ...cat,
          price: BigInt(cat.price),
        }));
      } else if (categories && typeof categories === 'object' && !Array.isArray(categories)) {
        categoriesArr = Object.entries(categories).map(([key, value]) => ({
          type: key.toUpperCase(),
          ...value,
          price: BigInt(value.price),
        }));
      }

      // 태그 findOrCreate → [{ tagId }]
      const tagObjs = await getOrCreateTagIds(tags);
      // 이미지 등록 → [{ imageId }]
      const imageObjs = await createImagesAndReturnIds(images);

      const newStyle = await prisma.style.create({
        data: {
          nickname,
          title,
          content,
          password,
          categories: {
            create: categoriesArr,
          },
          styleTags: {
            create: tagObjs.map((obj) => ({
              tag: { connect: { tagId: obj.tagId } },
            })),
          },
          styleImages: {
            create: imageObjs.map((obj) => ({
              image: { connect: { imageId: obj.imageId } },
            })),
          },
        },
        include: {
          categories: true,
          styleTags: { include: { tag: true } },
          styleImages: { include: { image: true } },
        },
      });

      // 응답에서 categories를 객체로 변환
      const response = {
        ...newStyle,
        categories: categoriesArrayToObject(newStyle.categories),
      };
      res.status(201).set('Content-Type', 'application/json').send(JSON.stringify(response, jsonBigIntReplacer));
    } catch (err) {
      next(err);
    }
  }

  // 스타일 목록 조회
  static async getStyles(req, res, next) {
    try {
      // const { page = 1, pageSize = 10, sort = 'latest', search } = req.query;

      // const where = search
      //   ? {
      //       OR: [
      //         { nickname: { contains: search } },
      //         { title: { contains: search } },
      //         { content: { contains: search } },
      //       ],
      //     }
      //   : {};

      // let orderBy;
      // if (sort === 'views') orderBy = { viewCount: 'desc' };
      // else if (sort === 'curation') orderBy = { curationCount: 'desc' };
      // else orderBy = { createdAt: 'desc' };

      // const [total, styles] = await Promise.all([
      //   prisma.style.count({ where }),
      //   prisma.style.findMany({
      //     where,
      //     skip: (page - 1) * pageSize,
      //     take: +pageSize,
      //     orderBy,
      //     include: {
      //       categories: true,
      //       styleTags: { include: { tag: true } },
      //       styleImages: { include: { image: true } },
      //       _count: { select: { curations: true } },
      //     },
      //   }),
      // ]);

      // // 각 style의 categories를 객체로 변환
      // const stylesObj = styles.map((style) => ({
      //   ...style,
      //   categories: categoriesArrayToObject(style.categories),
      // }));

      // res
      //   .set('Content-Type', 'application/json')
      //   .send(JSON.stringify({ total, styles: stylesObj }, jsonBigIntReplacer));
      const dummyData = {
        currentPage: 1,
        totalPages: 5,
        totalItemCount: 50,
        data: [
          {
            id: 1,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'sora',
            title: '오늘 코디 어때요?',
            tags: ['캐주얼', '스트릿'],
            categories: {
              top: { name: '셔츠', brand: '자라', price: 39000 },
              bottom: { name: '청바지', brand: '무신사', price: 49000 },
            },
            content: '셔츠와 청바지 조합 어떤가요?',
            viewCount: 234,
            curationCount: 48,
            createdAt: '2024-02-22T07:47:49.803Z',
          },
          {
            id: 2,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'minji',
            title: '오피스룩 추천받아요',
            tags: ['오피스', '심플'],
            categories: {
              top: { name: '블라우스', brand: 'H&M', price: 29000 },
              bottom: { name: '슬랙스', brand: '유니클로', price: 45000 },
            },
            content: '출근룩으로 무난할까요?',
            viewCount: 180,
            curationCount: 35,
            createdAt: '2024-02-23T09:15:00.000Z',
          },
          {
            id: 3,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'jay',
            title: '데이트룩 평가해주세요',
            tags: ['데이트', '심플'],
            categories: {
              top: { name: '니트', brand: '탑텐', price: 32000 },
              bottom: { name: '슬랙스', brand: '스파오', price: 42000 },
            },
            content: '무난한 스타일일까요?',
            viewCount: 275,
            curationCount: 50,
            createdAt: '2024-02-24T10:12:00.000Z',
          },
          {
            id: 4,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'mike',
            title: '캠퍼스룩 어때요?',
            tags: ['대학생', '편안함'],
            categories: {
              top: { name: '후드티', brand: '나이키', price: 59000 },
              bottom: { name: '조거팬츠', brand: '아디다스', price: 52000 },
            },
            content: '편하고 예쁜 코디 추천받아요',
            viewCount: 143,
            curationCount: 28,
            createdAt: '2024-02-24T13:45:00.000Z',
          },
          {
            id: 5,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'hana',
            title: '주말 나들이룩',
            tags: ['나들이', '화사함'],
            categories: {
              top: { name: '가디건', brand: '스튜디오럭스', price: 41000 },
              bottom: { name: '롱스커트', brand: '앤아더스토리즈', price: 63000 },
            },
            content: '주말 외출용으로 어떤가요?',
            viewCount: 302,
            curationCount: 62,
            createdAt: '2024-02-25T11:30:00.000Z',
          },
          {
            id: 6,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'daniel',
            title: '모임용 코디',
            tags: ['모임', '댄디'],
            categories: {
              top: { name: '셔츠', brand: '빈폴', price: 69000 },
              bottom: { name: '치노팬츠', brand: '지오다노', price: 47000 },
            },
            content: '20대 후반 남성 코디 추천받아요',
            viewCount: 98,
            curationCount: 12,
            createdAt: '2024-02-26T15:00:00.000Z',
          },
          {
            id: 7,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'emily',
            title: '봄 코디 어울릴까요?',
            tags: ['봄', '내추럴'],
            categories: {
              top: { name: '자켓', brand: '마시모두띠', price: 99000 },
              bottom: { name: '화이트진', brand: '리바이스', price: 88000 },
            },
            content: '화사하게 입어봤어요',
            viewCount: 155,
            curationCount: 31,
            createdAt: '2024-02-27T08:10:00.000Z',
          },
          {
            id: 8,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'andy',
            title: '캐주얼 룩 어떤가요?',
            tags: ['스트릿', '캐주얼'],
            categories: {
              top: { name: '맨투맨', brand: '커버낫', price: 43000 },
              bottom: { name: '카고팬츠', brand: '디스이즈네버댓', price: 54000 },
            },
            content: '요즘 트렌드 반영한 코디입니다',
            viewCount: 189,
            curationCount: 40,
            createdAt: '2024-02-28T10:20:00.000Z',
          },
          {
            id: 9,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'jiwoo',
            title: '깔끔한 데일리룩',
            tags: ['미니멀', '데일리'],
            categories: {
              top: { name: '니트', brand: '에잇세컨즈', price: 38000 },
              bottom: { name: '슬랙스', brand: '자라', price: 52000 },
            },
            content: '깔끔한 느낌 내봤어요',
            viewCount: 221,
            curationCount: 44,
            createdAt: '2024-02-29T14:00:00.000Z',
          },
          {
            id: 10,
            thumbnail:
              'https://sprint-be-project.s3.ap-northeast-2.amazonaws.com/howdoilook/4d864052-5755-4ce3-9ae3-b4313e749e87.jpg',
            nickname: 'leo',
            title: '데이트룩 스타일 평가!',
            tags: ['데이트', '심플'],
            categories: {
              top: { name: '티셔츠', brand: '유니클로', price: 19000 },
              bottom: { name: '슬랙스', brand: '스파오', price: 39000 },
            },
            content: '깔끔하게 입어봤어요!',
            viewCount: 310,
            curationCount: 70,
            createdAt: '2024-03-01T10:00:00.000Z',
          },
        ],
      };
      res.json(dummyData);
    } catch (err) {
      next(err);
    }
  }

  // 스타일 상세 조회 (+조회수 증가)
  static async getStyleDetail(req, res, next) {
    try {
      const { styleId } = req.params;

      // 조회수 증가
      await prisma.style.update({
        where: { styleId: +styleId },
        data: { viewCount: { increment: 1 } },
      });

      const style = await prisma.style.findUnique({
        where: { styleId: +styleId },
        include: {
          categories: true,
          styleTags: { include: { tag: true } },
          styleImages: { include: { image: true } },
          curations: true,
          comments: true,
        },
      });

      if (!style) return res.status(404).json({ message: '스타일을 찾을 수 없습니다.' });

      // 응답에서 categories를 객체로 변환
      const response = {
        ...style,
        categories: categoriesArrayToObject(style.categories),
      };
      res.set('Content-Type', 'application/json').send(JSON.stringify(response, jsonBigIntReplacer));
    } catch (err) {
      next(err);
    }
  }

  // 스타일 수정
  static async updateStyle(req, res, next) {
    try {
      const { styleId } = req.params;
      const { password, title, content, categories, tags = [], images = [] } = req.body;

      const style = await prisma.style.findUnique({ where: { styleId: +styleId } });
      if (!style) return res.status(404).json({ message: '스타일을 찾을 수 없습니다.' });
      if (style.password !== password) return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });

      // categories: 객체 또는 배열 → 배열로 변환 (Prisma 저장용)
      let categoriesArr = [];
      if (categories && Array.isArray(categories)) {
        categoriesArr = categories.map((cat) => ({
          ...cat,
          price: BigInt(cat.price),
        }));
      } else if (categories && typeof categories === 'object' && !Array.isArray(categories)) {
        categoriesArr = Object.entries(categories).map(([key, value]) => ({
          type: key.toUpperCase(),
          ...value,
          price: BigInt(value.price),
        }));
      }

      // 태그 findOrCreate
      const tagObjs = await getOrCreateTagIds(tags);
      // 이미지 등록
      const imageObjs = await createImagesAndReturnIds(images);

      // 기존 연결 데이터(카테고리, 태그, 이미지) 삭제 후 재생성 방식
      const updatedStyle = await prisma.style.update({
        where: { styleId: +styleId },
        data: {
          title,
          content,
          categories: { deleteMany: {}, create: categoriesArr },
          styleTags: { deleteMany: {}, create: tagObjs.map((obj) => ({ tag: { connect: { tagId: obj.tagId } } })) },
          styleImages: {
            deleteMany: {},
            create: imageObjs.map((obj) => ({
              image: {
                connect: { imageId: obj.imageId },
              },
            })),
          },
          updatedAt: new Date(),
        },
        include: {
          categories: true,
          styleTags: { include: { tag: true } },
          styleImages: { include: { image: true } },
        },
      });

      // 응답에서 categories를 객체로 변환
      const response = {
        ...updatedStyle,
        categories: categoriesArrayToObject(updatedStyle.categories),
      };
      res.set('Content-Type', 'application/json').send(JSON.stringify(response, jsonBigIntReplacer));
    } catch (err) {
      next(err);
    }
  }

  // 스타일 삭제
  static async deleteStyle(req, res, next) {
    try {
      const { styleId } = req.params;
      const { password } = req.body;
      const style = await prisma.style.findUnique({ where: { styleId: +styleId } });
      if (!style) return res.status(404).json({ message: '스타일을 찾을 수 없습니다.' });
      if (style.password !== password) return res.status(403).json({ message: '비밀번호가 일치하지 않습니다.' });

      await prisma.style.delete({ where: { styleId: +styleId } });
      res.json({ message: '스타일이 삭제되었습니다.' });
    } catch (err) {
      next(err);
    }
  }
}
