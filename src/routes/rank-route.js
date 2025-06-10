// express의 Router 함수 가져오기 -> 경로를 모듈화하여 관리할 수 있음음
import { Router } from 'express';      
// 랭킹 관련 요청을 처리할 컨트롤러 클래스를 불러옴
import RankController from '../controllers/rank-controller.js';     

// 새로운 라우터 인스턴스 생성
const router = Router();    

// 컨트롤러 클래스를 인스턴스화해서 사용할 준비를 함
const rankController = new RankController();    

// 🫠 Get/ranking 요청이 들어오면 getRankingList 메서드를 실행한다. 
// .bind() 메서드는 안에서 this가 클래스 인스턴스를 가리키도록 보장해준다.  
router.get('/', rankController.getRankingList.bind(rankController));

// 다른 곳에서 라우터 사용할 수 있도록 export 
export default router;    
