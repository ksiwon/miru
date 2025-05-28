// api/firebaseAPI.ts
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { UserData, QuestData } from '../types';

const USERS_COLLECTION = 'users';
const QUESTS_COLLECTION = 'quests';

export class FirebaseAPI {
  // 사용자 데이터 저장
  static async saveUserData(userData: UserData): Promise<void> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userData.name);
      const dataToSave = {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(userRef, dataToSave);
      console.log('User data saved successfully');
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('사용자 데이터 저장에 실패했습니다.');
    }
  }

  // 사용자 데이터 조회
  static async getUserData(userName: string): Promise<UserData | null> {
    try {
      const userRef = doc(db, USERS_COLLECTION, userName);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as UserData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      throw new Error('사용자 데이터 조회에 실패했습니다.');
    }
  }

  // 퀘스트 데이터 저장
  static async saveQuestData(questData: QuestData): Promise<void> {
    try {
      const questRef = doc(db, QUESTS_COLLECTION, `${questData.userName}_${Date.now()}`);
      const dataToSave = {
        ...questData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      
      await setDoc(questRef, dataToSave);
      console.log('Quest data saved successfully');
    } catch (error) {
      console.error('Error saving quest data:', error);
      throw new Error('퀘스트 데이터 저장에 실패했습니다.');
    }
  }

  // 사용자의 최신 퀘스트 조회
  static async getLatestQuestData(userName: string): Promise<QuestData | null> {
    try {
      const questsRef = collection(db, QUESTS_COLLECTION);
      const q = query(
        questsRef,
        where('userName', '==', userName),
        orderBy('createdAt', 'desc'),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as QuestData;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting quest data:', error);
      throw new Error('퀘스트 데이터 조회에 실패했습니다.');
    }
  }

  // 퀘스트 완료 상태 업데이트
  static async updateQuestCompletion(
    questDataId: string, 
    questId: string, 
    completed: boolean
  ): Promise<void> {
    try {
      const questRef = doc(db, QUESTS_COLLECTION, questDataId);
      const questDoc = await getDoc(questRef);
      
      if (questDoc.exists()) {
        const data = questDoc.data() as QuestData;
        const updatedQuests = data.quests.map(quest => 
          quest.id === questId 
            ? { 
                ...quest, 
                completed, 
                completedAt: completed ? new Date() : undefined 
              }
            : quest
        );
        
        await updateDoc(questRef, {
          quests: updatedQuests,
          updatedAt: Timestamp.now()
        });
        
        console.log('Quest completion updated successfully');
      }
    } catch (error) {
      console.error('Error updating quest completion:', error);
      throw new Error('퀘스트 완료 상태 업데이트에 실패했습니다.');
    }
  }

  // 사용자의 모든 퀘스트 히스토리 조회
  static async getAllQuestHistory(userName: string): Promise<QuestData[]> {
    try {
      const questsRef = collection(db, QUESTS_COLLECTION);
      const q = query(
        questsRef,
        where('userName', '==', userName),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const questHistory: QuestData[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        questHistory.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate()
        } as QuestData);
      });
      
      return questHistory;
    } catch (error) {
      console.error('Error getting quest history:', error);
      throw new Error('퀘스트 히스토리 조회에 실패했습니다.');
    }
  }
}