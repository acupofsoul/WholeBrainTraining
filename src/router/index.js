import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  // 第一阶段：冥想与放松训练
  {
    path: '/meditation',
    name: 'Meditation',
    component: () => import('../views/Meditation.vue'),
    children: [
      {
        path: 'guided-voice',
        name: 'GuidedVoice',
        component: () => import('../views/meditation/GuidedMeditation.vue')
      },
      {
        path: 'brainwave-generator',
        name: 'BrainwaveGenerator',
        component: () => import('../views/meditation/BrainwaveGenerator.vue')
      },
      {
        path: 'metronome',
        name: 'Metronome',
        component: () => import('../views/meditation/Metronome.vue')
      }
    ]
  },
  // 第二阶段：基础训练
  {
    path: '/basic-training',
    name: 'BasicTraining',
    component: () => import('../views/BasicTraining.vue'),
    children: [
      {
        path: 'overall-perception',
        name: 'OverallPerception',
        component: () => import('../views/basic/OverallPerception.vue')
      },
      {
        path: 'expand-vision',
        name: 'ExpandVision',
        component: () => import('../views/basic/ExpandVision.vue')
      },
      {
        path: 'reading-rhythm',
        name: 'ReadingRhythm',
        component: () => import('../views/basic/ReadingRhythm.vue')
      },
      {
        path: 'fluency',
        name: 'Fluency',
        component: () => import('../views/basic/Fluency.vue')
      },
      {
        path: 'attention',
        name: 'Attention',
        component: () => import('../views/basic/Attention.vue')
      },
      {
        path: 'schulte',
        name: 'Schulte',
        component: () => import('../views/basic/SchulteTable.vue')
      }
    ]
  },
  // 第三阶段：闪视训练
  {
    path: '/flash-training',
    name: 'FlashTraining',
    component: () => import('../views/FlashTraining.vue'),
    children: [
      {
        path: 'basic-flash',
        name: 'BasicFlash',
        component: () => import('../views/flash/BasicFlash.vue')
      },
      {
        path: 'article-flash',
        name: 'ArticleFlash',
        component: () => import('../views/flash/ArticleFlash.vue')
      },
      {
        path: 'image-flash',
        name: 'ImageFlash',
        component: () => import('../views/flash/ImageFlash.vue')
      },
      {
        path: 'custom-word-flash',
        name: 'CustomWordFlash',
        component: () => import('../views/flash/CustomWordFlash.vue')
      },
      {
        path: 'custom-image-flash',
        name: 'CustomImageFlash',
        component: () => import('../views/flash/CustomImageFlash.vue')
      }
    ]
  },
  // 第四阶段：速读训练
  {
    path: '/speed-reading',
    name: 'SpeedReading',
    component: () => import('../views/SpeedReading.vue'),
    children: [
      {
        path: 'article-reading',
        name: 'ArticleReading',
        component: () => import('../views/speed/ArticleReading.vue')
      },
      {
        path: '3d-reading',
        name: '3DReading',
        component: () => import('../views/speed/ThreeDReading.vue')
      }
    ]
  },
  // 第五阶段：照相记忆训练
  {
    path: '/photographic-memory',
    name: 'PhotographicMemory',
    component: () => import('../views/PhotoMemory.vue'),
    children: [
      {
        path: 'afterimage',
        name: 'Afterimage',
        component: () => import('../views/memory/AfterImage.vue')
      },
      {
        path: 'color-perception',
        name: 'ColorPerception',
        component: () => import('../views/memory/ColorPerception.vue')
      },
      {
        path: '3d-cards',
        name: '3DCards',
        component: () => import('../views/memory/3DCards.vue')
      },
      {
        path: 'thousand-images',
        name: 'ThousandImages',
        component: () => import('../views/memory/ThousandImages.vue')
      },
      {
        path: 'memory-training',
        name: 'MemoryTraining',
        component: () => import('../views/memory/MemoryTraining.vue')
      },
      {
        path: 'instant-calculation',
        name: 'InstantCalculation',
        component: () => import('../views/memory/InstantCalculation.vue')
      },
      {
        path: 'progress',
        name: 'PhotoMemoryProgress',
        component: () => import('../views/memory/PhotoMemoryProgress.vue')
      }
    ]
  },
  // 第六阶段：能力测评
  {
    path: '/abilities',
    alias: '/ability-assessment',
    name: 'Abilities',
    component: () => import('../views/AbilityAssessment.vue'),
    children: [
      {
        path: 'comprehensive',
        name: 'ComprehensiveAssessment',
        component: () => import('../views/abilities/ComprehensiveAssessment.vue')
      },
      {
        path: 'spatial',
        name: 'SpatialAssessment',
        component: () => import('../views/abilities/SpatialAssessment.vue')
      },
      {
        path: 'observation',
        name: 'ObservationAssessment',
        component: () => import('../views/abilities/ObservationAssessment.vue')
      },
      {
        path: 'calculation',
        name: 'CalculationAssessment',
        component: () => import('../views/abilities/CalculationAssessment.vue')
      },
      {
        path: 'memory',
        name: 'MemoryAssessment',
        component: () => import('../views/abilities/MemoryAssessment.vue')
      }
    ]
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('../views/Settings.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router