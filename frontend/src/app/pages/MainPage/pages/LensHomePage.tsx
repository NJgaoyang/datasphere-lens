import {
  ArrowRightOutlined,
  BarChartOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TableOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';

type Entry = {
  title: string;
  desc: string;
  path: string;
  icon: React.ReactNode;
  accent: string;
};

export function LensHomePage({ orgId }: { orgId: string }) {
  const navigate = useNavigate();
  const go = (path: string) => navigate(`/organizations/${orgId}/${path}`);

  const entries: Entry[] = [
    { title: '连接数据', desc: '接入业务数据库并验证连接', path: 'sources', icon: <DatabaseOutlined />, accent: 'blue' },
    { title: '准备数据集', desc: '整理字段、模型与计算口径', path: 'views', icon: <TableOutlined />, accent: 'violet' },
    { title: '开始分析', desc: '从数据集快速创建可视化', path: 'vizs', icon: <BarChartOutlined />, accent: 'cyan' },
    { title: '管理权限', desc: '控制资源与数据访问范围', path: 'permissions/subject', icon: <SafetyCertificateOutlined />, accent: 'amber' },
  ];
  return (
    <Page>
      <Hero>
        <HeroCopy>
          <Kicker>DATASPHERE LENS</Kicker>
          <h1>把企业数据变成可直接使用的分析资产</h1>
          <p>从数据连接、数据准备到图表和仪表板，用一条清晰链路完成内部 BI 分析。</p>
          <HeroActions>
            <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => go('views')}>
              新建数据集
            </Button>
            <Button size="large" onClick={() => go('vizs')}>
              进入分析资产
            </Button>
          </HeroActions>
        </HeroCopy>
        <FlowVisual>
          <FlowNode><DatabaseOutlined /><span>数据源</span></FlowNode>
          <FlowLine />
          <FlowNode><TableOutlined /><span>数据集</span></FlowNode>
          <FlowLine />
          <FlowNode><BarChartOutlined /><span>图表</span></FlowNode>
          <FlowLine />
          <FlowNode><DashboardOutlined /><span>仪表板</span></FlowNode>
        </FlowVisual>
      </Hero>

      <SectionHeader>
        <div>
          <span>快速开始</span>
          <h2>你今天想做什么？</h2>
        </div>
      </SectionHeader>

      <EntryGrid>
        {entries.map(entry => (
          <EntryCard key={entry.path} className={entry.accent} onClick={() => go(entry.path)}>
            <EntryIcon>{entry.icon}</EntryIcon>
            <div>
              <h3>{entry.title}</h3>
              <p>{entry.desc}</p>
            </div>
            <ArrowRightOutlined className="arrow" />
          </EntryCard>
        ))}
      </EntryGrid>
      <LowerGrid>
        <PrincipleCard>
          <span className="eyebrow">核心链路</span>
          <h3>数据源 → 数据集 → 图表 → 仪表板</h3>
          <p>所有可视化都基于数据集，不让图表直接耦合业务数据库表，后续权限、指标和 AI 才能统一治理。</p>
          <button onClick={() => go('views')}>
            管理数据集 <ArrowRightOutlined />
          </button>
        </PrincipleCard>
        <StatusCard>
          <span className="eyebrow">当前阶段</span>
          <h3>BI Core</h3>
          <StatusRow><i className="done" />数据源管理</StatusRow>
          <StatusRow><i className="done" />数据集工作台</StatusRow>
          <StatusRow><i className="doing" />分析资产与图表</StatusRow>
          <StatusRow><i />仪表板产品化</StatusRow>
        </StatusCard>
      </LowerGrid>
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  height: 100%;
  padding: 28px;
  overflow: auto;
`;

const Hero = styled.section`
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
  gap: 36px;
  min-height: 260px;
  padding: 34px 38px;
  overflow: hidden;
  color: #fff;
  background: linear-gradient(125deg, #101828 0%, #172554 55%, #312e81 100%);
  border-radius: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const HeroCopy = styled.div`
  position: relative;
  z-index: 1;
  align-self: center;

  h1 {
    max-width: 620px;
    margin: 8px 0 12px;
    font-size: 32px;
    line-height: 1.25;
    color: #fff;
    letter-spacing: -0.02em;
  }

  p {
    max-width: 590px;
    margin: 0;
    font-size: 14px;
    line-height: 1.8;
    color: #b8c4d8;
  }
`;

const Kicker = styled.div`
  font-size: 10px;
  font-weight: 700;
  color: #8eb3ff;
  letter-spacing: 0.16em;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 24px;
`;
const FlowVisual = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
`;

const FlowNode = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 82px;
  height: 82px;
  font-size: 22px;
  color: #dce8ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 18px;
  backdrop-filter: blur(8px);

  span {
    margin-top: -10px;
    font-size: 10px;
  }
`;

const FlowLine = styled.div`
  width: 28px;
  height: 1px;
  background: linear-gradient(90deg, rgba(142, 179, 255, 0.2), rgba(142, 179, 255, 0.9));
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin: 26px 0 14px;
  span {
    font-size: 10px;
    font-weight: 700;
    color: #667085;
    letter-spacing: 0.08em;
  }

  h2 {
    margin: 3px 0 0;
    font-size: 20px;
    color: #182230;
  }
`;

const EntryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const EntryCard = styled.button`
  position: relative;
  display: flex;
  gap: 13px;
  align-items: flex-start;
  min-height: 118px;
  padding: 18px;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 15px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  &:hover {
    box-shadow: 0 12px 28px rgba(16, 24, 40, 0.07);
    transform: translateY(-2px);
  }

  h3 {
    margin: 2px 0 6px;
    font-size: 14px;
    color: #1d2939;
  }

  p {
    margin: 0;
    font-size: 11px;
    line-height: 1.6;
    color: #667085;
  }

  .arrow {
    position: absolute;
    right: 16px;
    bottom: 16px;
    color: #98a2b3;
  }

`;

const EntryIcon = styled.div`
  display: grid;
  flex-shrink: 0;
  place-items: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  color: #315efb;
  background: #eef4ff;
  border-radius: 11px;
`;

const LowerGrid = styled.div`
  display: grid;
  grid-template-columns: 1.5fr 0.7fr;
  gap: 14px;
  margin-top: 14px;
  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

const PrincipleCard = styled.div`
  min-height: 170px;
  padding: 22px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 16px;

  .eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: #6d5dfc;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 9px 0 8px;
    font-size: 18px;
    color: #182230;
  }

  p {
    max-width: 760px;
    margin: 0;
    font-size: 12px;
    line-height: 1.7;
    color: #667085;
  }

  button {
    padding: 0;
    margin-top: 18px;
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    color: #315efb;
    cursor: pointer;
    background: none;
    border: 0;
  }
`;
const StatusCard = styled.div`
  min-height: 170px;
  padding: 22px;
  background: #fff;
  border: 1px solid #eaecf0;
  border-radius: 16px;

  .eyebrow {
    font-size: 10px;
    font-weight: 700;
    color: #667085;
    letter-spacing: 0.08em;
  }

  h3 {
    margin: 8px 0 14px;
    font-size: 18px;
    color: #182230;
  }
`;

const StatusRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 8px 0;
  font-size: 11px;
  color: #667085;

  i {
    width: 7px;
    height: 7px;
    background: #d0d5dd;
    border-radius: 50%;
  }

  i.done { background: #12b76a; }
  i.doing { background: #f79009; }
`;
