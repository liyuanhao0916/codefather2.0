# 单元测试

## Mock

```java
package com.jd.overseas.edm.web;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.jd.overseas.edm.common.constants.ResultJson;
import com.jd.overseas.edm.common.constants.ResultPageJson;
import com.jd.overseas.edm.common.utils.DateUtil;
import com.jd.overseas.edm.dao.*;
import com.jd.overseas.edm.model.*;
import com.jd.overseas.edm.service.*;
import com.jd.overseas.edm.service.impl.MarketingCampaignServiceImpl;
import com.jd.overseas.edm.vo.CampaignListVo;
import com.jd.overseas.edm.web.controller.MarketingCampaignController;
import com.jd.security.tde.util.StringUtils;
import lombok.extern.slf4j.Slf4j;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.MockitoJUnitRunner;
import org.springframework.boot.test.context.SpringBootTest;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

//@SpringBootTest(classes = EdmWebApplication.class)
@RunWith(MockitoJUnitRunner.class)
@Slf4j
public class MarketingCampaignTest extends BaseTest {

    private MarketingCampaignServiceImpl marketingCampaignService;

    private MarketingCampaignController marketingCampaignController;

    @Mock
    private MarketingCampaignDao marketingCampaignDao;

    @Mock
    private EdmApiUserDao edmApiUserDao;

    @Mock
    private EdmUserInfoDao edmUserInfoDao;

    @Mock
    private ContactPersonDao contactPersonDao;

    @Mock
    private TemplateEmailDao templateEmailDao;

    @Mock
    private SendCloudAdaptorService sendCloudAdaptorService;

    @Mock
    private EdmDomainInfoDao edmDomainInfoDao;

    @Mock
    private CrowdDao crowdDao;

    @Mock
    private HttpServletRequest request;

    @Before
    public void setup() {
        this.marketingCampaignService = new MarketingCampaignServiceImpl();
        marketingCampaignService.setCrowdDao(crowdDao);
        marketingCampaignService.setContactPersonDao(contactPersonDao);
        marketingCampaignService.setEdmDomainInfoDao(edmDomainInfoDao);
        marketingCampaignService.setSendCloudAdaptorService(sendCloudAdaptorService);
        marketingCampaignService.setTemplateEmailDao(templateEmailDao);
        marketingCampaignService.setEdmUserInfoDao(edmUserInfoDao);
        marketingCampaignService.setMarketingCampaignDao(marketingCampaignDao);
        marketingCampaignService.setEdmApiUserDao(edmApiUserDao);

        this.marketingCampaignController = new MarketingCampaignController();
        marketingCampaignController.setMarketingCampaignService(marketingCampaignService);
        marketingCampaignController.setTestPin("testPin123");
        marketingCampaignController.setSkipLogin(true);
    }

    @Test
    public void addCampaign() {
        // 入参
        MarketingCampaign campaign = new MarketingCampaign();
        campaign.setCampaignName("zhenyuetest");
        campaign.setCampaignType(0);
        campaign.setCampaignStatus(2);
        campaign.setApiKey("xxxx111");
        campaign.setApiUser("djdjdj");
        campaign.setCrowdId(1L);
        campaign.setEmailId(1L);
        campaign.setEmailSubject("sss");
        campaign.setEmailSummary("sss");
        campaign.setFromAddress("xxx@example.com");
        campaign.setFromDomain("example.com");
        campaign.setFromName("test");
        campaign.setJdUserPin("jdjd");
        campaign.setLabelId(125L);
        campaign.setLabelName("dsdf");
        campaign.setSendTime(new Date());
        campaign.setCreateTime(new Date());
        campaign.setUpdateTime(new Date());

        // Mock 返回值

        Mockito.when(edmUserInfoDao.selectOne(new LambdaQueryWrapper<EdmUserInfo>()
                .eq(campaign.getJdUserPin() != null, EdmUserInfo::getJdUserPin, campaign.getJdUserPin())
                .eq(EdmUserInfo::getDelFlag, 0)))
                .thenReturn(EdmUserInfo.builder().userEmailCount(1000).build());

        Mockito.when(marketingCampaignDao.selectCount(new LambdaQueryWrapper<MarketingCampaign>()
                .eq(campaign.getJdUserPin() != null, MarketingCampaign::getJdUserPin, campaign.getJdUserPin())
                .eq(MarketingCampaign::getDelFlag, 0)))
                .thenReturn(11L);

        Mockito.when(edmDomainInfoDao.selectCount(new LambdaQueryWrapper<EdmDomainInfo>()
                .eq(EdmDomainInfo::getJdUserPin, campaign.getJdUserPin())
                .eq(EdmDomainInfo::getDomainName, campaign.getFromDomain())
                .eq(EdmDomainInfo::getSpfStatus, 1)
                .eq(EdmDomainInfo::getDkimStatus, 1)
                .eq(EdmDomainInfo::getMxStatus, 1)
                .eq(EdmDomainInfo::getDelFlag, 0)))
                .thenReturn(11L);

        Mockito.when(templateEmailDao.selectOne(new LambdaQueryWrapper<TemplateEmail>()
                .eq(campaign.getEmailId() != null, TemplateEmail::getSsEmailId, campaign.getEmailId())
                .eq(TemplateEmail::getDelFlag, 0)))
                .thenReturn(new TemplateEmail());

        Mockito.when(contactPersonDao.selectCount(new LambdaQueryWrapper<ContactPerson>()
                .eq(campaign.getCrowdId() != null, ContactPerson::getCrowdId, campaign.getCrowdId())
                .eq(ContactPerson::getDelFlag, 0)))
                .thenReturn(1L);

        EdmApiUser apiUser = EdmApiUser.builder().apiUser("apiUser").apiKey("apiUser").build();
        Mockito.when(edmApiUserDao.selectOne(new LambdaQueryWrapper<EdmApiUser>()
                .eq(EdmApiUser::getDomainName, campaign.getFromDomain())
                .eq(EdmApiUser::getDelFlag, 0)))
                .thenReturn(apiUser);

        ResultJson<JSONObject> resultJson = new ResultJson<>();
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("labelId", 11);
        jsonObject.put("labelName", "labelName");
        resultJson.setData(jsonObject);
        Mockito.when(sendCloudAdaptorService.addLabel(apiUser.getApiUser(), apiUser.getApiKey(), UUID.randomUUID().toString()))
                .thenReturn(resultJson);

        // 调用
        marketingCampaignService.addCampaign(campaign);
        marketingCampaignController.addCampaign(campaign.getCampaignName(),
                campaign.getEmailSubject(),
                campaign.getEmailSummary(),
                campaign.getFromDomain(),
                campaign.getFromAddress(),
                campaign.getFromName(),
                campaign.getCrowdId(),
                campaign.getEmailId().toString(),
                campaign.getCampaignType(),
                DateUtil.format(DateUtil.FORMAT_MIN, campaign.getSendTime()));
    }

}

```

