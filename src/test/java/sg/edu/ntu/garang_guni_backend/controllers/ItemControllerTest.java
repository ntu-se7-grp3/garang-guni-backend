package sg.edu.ntu.garang_guni_backend.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jayway.jsonpath.JsonPath;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.web.bind.MethodArgumentNotValidException;
import sg.edu.ntu.garang_guni_backend.entities.Item;
import sg.edu.ntu.garang_guni_backend.exceptions.image.ImageUnsupportedTypeException;
import sg.edu.ntu.garang_guni_backend.exceptions.item.ItemNotFoundException;
import sg.edu.ntu.garang_guni_backend.services.impls.ImageServiceImpl;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ItemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ImageServiceImpl imgService;

    @Autowired
    private ObjectMapper objectMapper;
    private static Item sampleItem;
    private static Item updatedItem;
    private static Item itemWithoutName;
    private static Item itemWithoutDescription;
    private static Item itemWithNothing;
    
    @BeforeAll
    static void setUp() {
        sampleItem = Item.builder()
                .itemName("Aluminium Cans")
                .itemDescription("It's a metal can.")
                .build();
        
        updatedItem = Item.builder()
                .itemName("Steel Cans")
                .itemDescription("It's STILL a metal can.")
                .build();

        itemWithoutName = Item.builder()
                .itemDescription("It's a metal can.")
                .build();

        itemWithoutDescription = Item.builder()
                .itemName("Aluminium Cans")
                .build();

        itemWithNothing = new Item();
    }

    @DisplayName("Create Item - Successful")
    @Test
    void createItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder request = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        mockMvc.perform(request)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."));       
    }

    @DisplayName("Create Item - Missing Parameters")
    @Test
    void createItemWithMissingParametersTest() throws Exception {
        String newItemWithoutNameAsJson = objectMapper
                .writeValueAsString(itemWithoutName);
        String newItemWithoutDescriptionAsJson = objectMapper
                .writeValueAsString(itemWithoutDescription);
        String newItemWithNothingAsJson = objectMapper
                .writeValueAsString(itemWithNothing);
        
        RequestBuilder requestWithNoName = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithoutNameAsJson);
        RequestBuilder requestWithNoDescription = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithoutDescriptionAsJson);
        RequestBuilder requestWithNothing = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(newItemWithNothingAsJson);
        
        mockMvc.perform(requestWithNoName)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(requestWithNoDescription)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(requestWithNothing)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }

    @DisplayName("Get Item By Id - Sucessful")
    @Test
    void getItemByIdTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."));
    }

    @DisplayName("Get Item By Id - Invalid Id")
    @Test
    void getItemByNonExistentIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder getRequest = MockMvcRequestBuilders.get(
                "/items/" + createdItemId);

        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Successful")
    @Test
    void updateItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId")
                            .value(createdItemId))
                .andExpect(jsonPath("$.itemName")
                            .value("Steel Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's STILL a metal can."));
    }

    @DisplayName("Update Item - Invalid Id")
    @Test
    void updateItemWithNonExistantIdTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        String updatedItemAsJson = objectMapper.writeValueAsString(updatedItem);

        RequestBuilder putRequest = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemAsJson);

        mockMvc.perform(putRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Update Item - Invalid Item")
    @Test
    void updateItemWithInvalidItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        String updatedItemWithoutNameAsJson = objectMapper
                .writeValueAsString(itemWithoutName);
        String updatedItemWithoutDescriptionAsJson = objectMapper
                .writeValueAsString(itemWithoutDescription);
        String updatedItemWithNothingAsJson = objectMapper
                .writeValueAsString(itemWithNothing);

        RequestBuilder putRequestWithNamelessItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithoutNameAsJson);
        RequestBuilder putRequestWithDescriptionlessItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithoutDescriptionAsJson);
        RequestBuilder putRequestWithBlankItem = MockMvcRequestBuilders
                .put("/items/" + createdItemId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(updatedItemWithNothingAsJson);

        mockMvc.perform(putRequestWithNamelessItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(putRequestWithDescriptionlessItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
        mockMvc.perform(putRequestWithBlankItem)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof MethodArgumentNotValidException));
    }

    @DisplayName("Delete Item - Successful")
    @Test
    void deleteItemTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
                
        String createdItemAsJson = mockMvc.perform(createRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNoContent());
        
        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId);
        
        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Delete Item - Invalid Id")
    @Test
    void deleteNonExistentItemTest() throws Exception {
        String createdItemId = UUID.randomUUID().toString();

        RequestBuilder deleteRequest = MockMvcRequestBuilders
                .delete("/items/" + createdItemId);

        mockMvc.perform(deleteRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Add Image To Item - Successful")
    @Test
    void addImageToItemtest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createItemRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        String createdItemAsJson = mockMvc.perform(createItemRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  

        MockMultipartFile imageToAdd = new MockMultipartFile("image",
                "image_to_add.png", 
                "image/png",
                "This is a test image".getBytes());
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd);
                
        String unFormattedImgId = mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Get Content As String -> gives extra ""
        String imgId = unFormattedImgId.replaceAll("^\"|\"$", "");

        assertTrue(imgService.isLinked(imgId, createdItemId));
    }

    @DisplayName("Add Image To Item - Invalid Id")
    @Test
    void addImageToNonExistantItemtest() throws Exception {
        UUID invalidId = UUID.randomUUID();

        MockMultipartFile imageToAdd = new MockMultipartFile("image",
                "image_to_add.png", 
                "image/png",
                "This is a test image".getBytes());
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + invalidId + "/images")
                .file(imageToAdd);
                
        mockMvc.perform(postRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }

    @DisplayName("Add Image To Item - Invalid File type")
    @Test
    void addTextFileToItemtest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createItemRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        String createdItemAsJson = mockMvc.perform(createItemRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  

        MockMultipartFile imageToAdd = new MockMultipartFile("image",
                "text_to_add.txt", 
                "text/plain",
                "This is a text file".getBytes());
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd);
                
        mockMvc.perform(postRequest)
                .andExpect(status().isBadRequest())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ImageUnsupportedTypeException));
    }

    @DisplayName("View All Images - Successful")
    @Test
    void viewAllImagesTest() throws Exception {
        String sampleItemAsJson = objectMapper.writeValueAsString(sampleItem);

        RequestBuilder createItemRequest = MockMvcRequestBuilders.post("/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(sampleItemAsJson);
        
        String createdItemAsJson = mockMvc.perform(createItemRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.itemId").exists())
                .andExpect(jsonPath("$.itemName")
                            .value("Aluminium Cans"))
                .andExpect(jsonPath("$.itemDescription")
                            .value("It's a metal can."))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        String createdItemId = JsonPath.read(createdItemAsJson, "$.itemId");  

        MockMultipartFile imageToAdd = new MockMultipartFile("image",
                "image_to_add.png", 
                "image/png",
                "This is a test image".getBytes());
        
        MockMultipartFile imageToAdd2 = new MockMultipartFile("image",
                "image_to_add2.png", 
                "image/png",
                "This is a test image 2".getBytes());
        
        RequestBuilder postRequest = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd);
                
        String unFormattedImgId = mockMvc.perform(postRequest)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        // Get Content As String -> gives extra ""
        String imgId = unFormattedImgId.replaceAll("^\"|\"$", "");
        
        assertTrue(imgService.isLinked(imgId, createdItemId));
        
        RequestBuilder postRequest2 = MockMvcRequestBuilders
                .multipart("/items/" + createdItemId + "/images")
                .file(imageToAdd2);
                
        String unFormattedImgId2 = mockMvc.perform(postRequest2)
                .andExpect(status().isCreated())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();

        // Get Content As String -> gives extra ""
        String imgId2 = unFormattedImgId2.replaceAll("^\"|\"$", "");

        assertTrue(imgService.isLinked(imgId2, createdItemId));

        RequestBuilder getAllImgRequest = MockMvcRequestBuilders
                .get("/items/" + createdItemId + "/images");
        
        String retrievedImgListJson = mockMvc.perform(getAllImgRequest)
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andReturn()
                .getResponse()
                .getContentAsString();
        
        List<String> images = objectMapper.readValue(retrievedImgListJson, 
                new TypeReference<List<String>>() {}); 
        
        assertEquals(2, images.size());
        assertTrue(images.stream().anyMatch(image -> 
                image.equals("VGhpcyBpcyBhIHRlc3QgaW1hZ2U=")));
        assertTrue(images.stream().anyMatch(image -> 
                image.equals("VGhpcyBpcyBhIHRlc3QgaW1hZ2UgMg==")));
    }

    @DisplayName("View All Images - Invalid Id")
    @Test
    void viewAllImagesWithNonExistantItemTest() throws Exception {
        UUID randomUuid = UUID.randomUUID();
        RequestBuilder getRequest = MockMvcRequestBuilders
                .get("/items/" + randomUuid + "/images");
        
        mockMvc.perform(getRequest)
                .andExpect(status().isNotFound())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(result -> 
                    assertTrue(result.getResolvedException() 
                        instanceof ItemNotFoundException));
    }
}
