import type { RoleProfile } from '../types'

export const azureRoleProfiles: RoleProfile[] = [
  {
    id: 'cloud-administrator',
    name: 'Cloud Administrator',
    description: 'Operates and maintains Azure resources and identities.',
    primaryCertificationIds: ['az-104'],
    secondaryCertificationIds: ['az-900'],
  },
  {
    id: 'solutions-architect',
    name: 'Solutions Architect',
    description: 'Designs secure, scalable and cost-efficient Azure architectures.',
    primaryCertificationIds: ['az-305'],
    secondaryCertificationIds: ['az-104', 'az-700'],
  },
  {
    id: 'devops-engineer',
    name: 'DevOps Engineer',
    description: 'Builds delivery pipelines and operational automation for Azure workloads.',
    primaryCertificationIds: ['az-400'],
    secondaryCertificationIds: ['az-104', 'az-204'],
  },
  {
    id: 'security-engineer',
    name: 'Security Engineer',
    description: 'Implements identity, data, network, and workload security controls in Azure.',
    primaryCertificationIds: ['az-500'],
    secondaryCertificationIds: ['az-104'],
  },
  {
    id: 'network-engineer',
    name: 'Network Engineer',
    description: 'Designs and operates Azure network connectivity and traffic management.',
    primaryCertificationIds: ['az-700'],
    secondaryCertificationIds: ['az-104'],
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    description: 'Builds and maintains data platforms and pipelines on Azure.',
    primaryCertificationIds: ['dp-203'],
    secondaryCertificationIds: ['dp-900'],
  },
  {
    id: 'ai-engineer',
    name: 'AI Engineer',
    description: 'Designs and deploys AI solutions using Azure AI services.',
    primaryCertificationIds: ['ai-102'],
    secondaryCertificationIds: ['ai-900', 'az-204'],
  },
  {
    id: 'sap-architect',
    name: 'SAP Architect',
    description: 'Plans and operates SAP workloads on Azure infrastructure.',
    primaryCertificationIds: ['az-120'],
    secondaryCertificationIds: ['az-104'],
  },
]
