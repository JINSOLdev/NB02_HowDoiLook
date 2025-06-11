import { getTagList } from '../services/tag-services.js';

export const handleGetTagList = async (_req, res, next) => {
  try {
    // const tagList = await getTagList();

    // res.status(200).json({
    //   ...tagList,
    // });

    const dummyData = {
      tags: ['캐주얼', '스트릿', '미니멀', '빈티지', '유니크', '포멀', '시크', '레트로', '스포티', '걸리시'],
    };
    res.json(dummyData);
  } catch (error) {
    next(error);
  }
};
