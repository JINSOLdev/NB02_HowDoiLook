import db from '../config/db.js';

// 스타일 등록
export const createStyle = async ({ nickname, title, content, password, categories, tags, images }) => {
  const newStyle = await db.style.create({
    data: {
      nickname,
      title,
      content,
      password,
      categories: {
        create: categories || [],
      },
      styleTags: {
        create: tags?.map(({ tagId }) => ({ tagId })) || [],
      },
      images: {
        create: images?.map(({ url }) => ({ imageUrl: url })) || [],
      },
    },
    include: {
      categories: true,
      styleTags: { include: { tag: true } },
      images: true,
    },
  });
  return newStyle;
};

// 스타일 목록조회
// export const getStyleList = async () => {
//   const styleList = await db.style.findMany({
//     include: {
//       categories: true,
//       styleTags: { include: { tag: true } },
//       styleImages: true,
//     },
//   });

//   const totalCount = await db.style.count();

//   return {
//     totalCount,
//     list: styleList,
//   };
// };

export const getStyleList = async () => {
  const styleList = await db.style.findMany({
    include: {
      categories: true,
      styleTags: { include: { tag: true } },
      styleImages: { include: { image: true } }, // 수정됨
      _count: { select: { curations: true } }, // controller 쪽과 맞춤
    },
  });

  const totalItemCount = await db.style.count();

  const data = styleList.map((style) => ({
    id: style.id, // 이제 잘 들어옴
    thumbnail: style.styleImages?.[0]?.image?.url || null,
    nickname: style.nickname,
    title: style.title,
    tags: style.styleTags.map((tagObj) => tagObj.tag.name),
    categories: categoriesArrayToObject(style.categories),
    content: style.content,
    viewCount: style.viewCount,
    curationCount: style._count.curations,
    createdAt: style.createdAt,
  }));

  return {
    currentPage: 1,
    totalPages: 1,
    totalItemCount,
    data,
  };
};

// 스타일 상세조회
export const getStyleDetail = async (styleId) => {
  // 조회수 증가
  await db.style.update({
    where: { styleId: +styleId },
    data: { viewCount: { increment: 1 } },
  });

  const style = await db.style.findUnique({
    where: { styleId: +styleId },
    include: {
      categories: true,
      styleTags: { include: { tag: true } },
      images: true,
      curations: true,
      comments: true,
    },
  });
  return style;
};

// 스타일 수정
export const updateStyle = async (styleId, { title, content, categories, tags, images }) => {
  const updatedStyle = await db.style.update({
    where: { styleId: +styleId },
    data: {
      title,
      content,
      categories: { deleteMany: {}, create: categories || [] },
      styleTags: { deleteMany: {}, create: (tags || []).map(({ tagId }) => ({ tagId })) },
      images: { deleteMany: {}, create: (images || []).map(({ url }) => ({ imageUrl: url })) },
      updatedAt: new Date(),
    },
    include: {
      categories: true,
      styleTags: { include: { tag: true } },
      images: true,
    },
  });
  return updatedStyle;
};

// 스타일 삭제
export const deleteStyle = async (styleId) => {
  await db.style.delete({ where: { styleId: +styleId } });
  return { message: '스타일이 삭제되었습니다.' };
};
